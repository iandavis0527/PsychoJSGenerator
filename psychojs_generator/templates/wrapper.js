import { core, data } from './lib/psychojs-2021.2.3.js.js.js';

const { PsychoJS } = core;
const { ExperimentHandler } = data;

ExperimentHandler.prototype.normalSave = ExperimentHandler.prototype.normalSave;
ExperimentHandler.prototype.save = async function ({ attributes = [], sync = false } = {}) {
    const info = this.extraInfo;
    const __experimentName = (typeof info.expName !== 'undefined') ? info.expName : this.psychoJS.config.experiment.name;
    const __participant = ((typeof info.participant === 'string' && info.participant.length > 0) ? info.participant : 'PARTICIPANT');
    const __datetime = ((typeof info.date !== 'undefined') ? info.date : MonotonicClock.getDateStr());
    const key = __participant + '_' + __experimentName + '_' + __datetime + '.csv';
    const worksheet = XLSX.utils.json_to_sheet(this._trialsData);
    const csv = '\ufeff' + XLSX.utils.sheet_to_csv(worksheet);
    let formData = new FormData();
    formData.append("result", new Blob([csv], { type: "text/csv" }), key);
    await fetch("/results", { method: "POST", body: formData });
};
