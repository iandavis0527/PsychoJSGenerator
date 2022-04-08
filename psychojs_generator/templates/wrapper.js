import { core, data } from "./lib/psychojs-{version}.js";

const { PsychoJS, ServerManager } = core;
const { ExperimentHandler, TrialHandler } = data;

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

// TrialHandler.importConditions = function (
//   serverManager,
//   resourceName,
//   selection = null
// ) {
//   if (resourceName !== "conditions.xlsx") {
//     return TrialHandler.normalImportConditions(
//       serverManager,
//       resourceName,
//       selection
//     );
//   }

//   try {
//     const resourceValue = serverManager.getResource(resourceName, true);
//     const workbook = XLSX.read(resourceValue);

//     // we consider only the first worksheet:
//     if (workbook.SheetNames.length === 0) {
//       throw "workbook should contain at least one worksheet";
//     }
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     // worksheet to array of arrays (the first array contains the fields):
//     const sheet = XLSX.utils.sheet_to_json(worksheet, {
//       header: 1,
//       blankrows: false,
//     });
//     const fields = sheet.shift();

//     // (*) select conditions:
//     const selectedRows =
//       selection === null ? sheet : util.selectFromArray(sheet, selection);

//     // (*) return the selected conditions as an array of 'object as map':
//     // [
//     // {field0: value0-0, field1: value0-1, ...}
//     // {field0: value1-0, field1: value1-1, ...}
//     // ...
//     // ]
//     let trialList = new Array(selectedRows.length - 1);
//     for (let r = 0; r < selectedRows.length; ++r) {
//       let row = selectedRows[r];
//       let trial = {};
//       for (let l = 0; l < fields.length; ++l) {
//         let value = row[l];

//         // Look for string encoded arrays in the form of '[1, 2]'
//         const arrayMaybe = util.turnSquareBracketsIntoArrays(value);

//         if (Array.isArray(arrayMaybe)) {
//           // Keep the first match if more than one are found. If the
//           // input string looked like '[1, 2][3, 4]' for example,
//           // the resulting `value` would be [1, 2]. When `arrayMaybe` is
//           // empty, `value` turns `undefined`.
//           value = arrayMaybe;
//         }

//         if (typeof value === "string") {
//           const numberMaybe = Number.parseFloat(value);

//           // if value is a numerical string, convert it to a number:
//           if (
//             !isNaN(numberMaybe) &&
//             numberMaybe.toString().length === value.length
//           ) {
//             value = numberMaybe;
//           } else {
//             // Parse doubly escaped line feeds
//             value = value.replace(/(\n)/g, "\n");
//           }
//         }

//         trial[fields[l]] = value;
//       }
//       trialList[r] = trial;
//     }

//     return trialList;
//   } catch (error) {
//     throw {
//       origin: "TrialHandler.importConditions",
//       context: `when importing condition: ${resourceName}`,
//       error,
//     };
//   }
// };

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
    typeof info.date !== "undefined" ? info.date : MonotonicClock.getDateStr();
  const key =
    __participant + "_" + __experimentName + "_" + __datetime + ".csv";
  const worksheet = XLSX.utils.json_to_sheet(this._trialsData);
  const csv = "\ufeff" + XLSX.utils.sheet_to_csv(worksheet);
  let formData = new FormData();
  formData.append("result", new Blob([csv], { type: "text/csv" }), key);
  await fetch("/results", { method: "POST", body: formData });
};
