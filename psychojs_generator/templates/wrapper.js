import { core, data, util } from "./lib/psychojs-2022.2.4.js";
const { PsychoJS, ServerManager } = core;
const { ExperimentHandler } = data;

const version = "0.0.22";

console.debug(
    `[PSYCHOJS_GENERATOR] experiment generated with psychojs generator version ${version}`
);

ServerManager.prototype._listResources = async function () {
    return (await fetch("/resources/list")).json();
};

ServerManager.prototype._downloadResources = async function (resources) {
    console.debug("_downloadResources called");
    for (const { name, path } of resources) {
        let data = await fetch(path);

        data = await data.blob();

        if (name.endsWith(".xlsx")) {
            data = await data.arrayBuffer();
        }

        if (name.endsWith(".png") || name.endsWith(".jpg")) {
            const element = new Image();
            element.src = URL.createObjectURL(data);
            data = element;
        }

        this._resources.set(name, {
            path: path,
            data: data,
            status: ServerManager.ResourceStatus.DOWNLOADED,
        });
    }
};

ServerManager.prototype.prepareResources = async function (resources = []) {
    console.debug("prepareResources called");
    resources = await this._listResources();
    return this._downloadResources(resources);
};

PsychoJS.prototype.setRedirectUrls = function (completionUrl, cancellationUrl) {
    const regex = /https?:\/\/?/;
    this._completionUrl = completionUrl.replace(regex, "https://");
    this._cancellationUrl = cancellationUrl.replace(regex, "https://");
};

ExperimentHandler.prototype.normalSave = ExperimentHandler.prototype.save;
ExperimentHandler.prototype.save = async function ({
    attributes = [],
    sync = false,
} = {}) {
    const info = this.extraInfo;
    const __experimentName =
        typeof info.expName !== "undefined"
            ? info.expName
            : this.psychoJS.config.experiment.name;
    const __participant =
        typeof info.participant === "string" && info.participant.length > 0
            ? info.participant
            : "PARTICIPANT";
    const __datetime =
        typeof info.date !== "undefined"
            ? info.date
            : MonotonicClock.getDateStr();
    const key =
        __participant + "_" + __experimentName + "_" + __datetime + ".csv";
    const worksheet = XLSX.utils.json_to_sheet(this._trialsData);
    const csv = "\ufeff" + XLSX.utils.sheet_to_csv(worksheet);
    let formData = new FormData();
    formData.append("result", new Blob([csv], { type: "text/csv" }), key);
    await fetch("/results", { method: "POST", body: formData });
};

PsychoJS.prototype.quit = async function ({
    message,
    isCompleted = false,
} = {}) {
    console.debug(`[PSYCHOJS_GENERATOR] inside custom PsychoJS.quit function`);
    this.logger.info("[PsychoJS] Quit.");

    this._experiment.experimentEnded = true;
    this._status = PsychoJS.Status.FINISHED;
    const isServerEnv =
        this.getEnvironment() === ExperimentHandler.Environment.SERVER;

    try {
        // stop the main scheduler:
        this._scheduler.stop();

        // remove the beforeunload listener:
        if (isServerEnv) {
            window.removeEventListener(
                "beforeunload",
                this.beforeunloadCallback
            );
        }

        // save the results and the logs of the experiment:
        this.gui.finishDialog({
            text: "Terminating the experiment. Please wait a few moments...",
            nbSteps: 2 + (isServerEnv ? 1 : 0),
        });

        if (isCompleted || this._config.experiment.saveIncompleteResults) {
            if (!this._serverMsg.has("__noOutput")) {
                this.gui.finishDialogNextStep("saving results");
                await this._experiment.save();
                this.gui.finishDialogNextStep("saving logs");
                await this._logger.flush();
            }
        }

        // close the session:
        if (isServerEnv) {
            this.gui.finishDialogNextStep("closing the session");
            await this._serverManager.closeSession(isCompleted);
        }

        // thank participant for waiting and either quit or redirect:
        let text = "Thank you for your patience.<br/><br/>";
        text += typeof message !== "undefined" ? message : "Goodbye!";
        const self = this;
        this._gui.dialog({
            message: text,
            onOK: () => {
                // close the window:
                self._window.close();

                // remove everything from the browser window:
                while (document.body.hasChildNodes()) {
                    document.body.removeChild(document.body.lastChild);
                }

                // return from fullscreen if we were there:
                this._window.closeFullScreen();

                // redirect if redirection URLs have been provided:
                if (isCompleted && typeof self._completionUrl !== "undefined") {
                    console.debug(`redirecting to completion url`);
                    window.location = self._completionUrl;
                } else if (
                    !isCompleted &&
                    typeof self._cancellationUrl !== "undefined" &&
                    self._cancellationUrl !== ""
                ) {
                    console.debug(`redirecting to cancellation url`);
                    // window.location = self._cancellationUrl;
                } else {
                    console.debug(
                        `no redirection urls defined, closing window`
                    );
                    window.close();
                }
            },
        });
    } catch (error) {
        console.error(error);
        this._gui.dialog({ error });
    }
};

// $(document).on("keydown", function (e) {
//     quitPsychoJS("The [Escape] key was pressed. Goodbye!", false);
//     if (e.key == "Escape") e.stopPropagation();
// });
