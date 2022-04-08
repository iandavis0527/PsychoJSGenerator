/*****************
 * Project1 Test *
 *****************/

import { core, data, sound, util, visual } from "./lib/psychojs-2021.2.3.js";
const { PsychoJS } = core;
const { TrialHandler } = data;
const { Scheduler } = util;
//some handy aliases as in the psychopy scripts;
const { abs, sin, cos, PI: pi, sqrt } = Math;
const { round } = util;

// store info about the experiment session:
let expName = "project1"; // from the Builder filename that created this script
let expInfo = { participant: "", session: "001" };

// Start code blocks for 'Before Experiment'
// init psychoJS:
const psychoJS = new PsychoJS({
  debug: true,
});

// open window:
psychoJS.openWindow({
  fullscr: true,
  color: new util.Color([0, 0, 0]),
  units: "height",
  waitBlanking: true,
});
// schedule the experiment:
psychoJS.schedule(
  psychoJS.gui.DlgFromDict({
    dictionary: expInfo,
    title: expName,
  })
);

const flowScheduler = new Scheduler(psychoJS);
const dialogCancelScheduler = new Scheduler(psychoJS);
psychoJS.scheduleCondition(
  function () {
    return psychoJS.gui.dialogComponent.button === "OK";
  },
  flowScheduler,
  dialogCancelScheduler
);

// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
flowScheduler.add(instructionsRoutineBegin());
flowScheduler.add(instructionsRoutineEachFrame());
flowScheduler.add(instructionsRoutineEnd());
flowScheduler.add(trialRoutineBegin());
flowScheduler.add(trialRoutineEachFrame());
flowScheduler.add(trialRoutineEnd());
flowScheduler.add(quitPsychoJS, "", true);

// quit if user presses Cancel in dialog box:
dialogCancelScheduler.add(quitPsychoJS, "", false);

psychoJS.start({
  expName: expName,
  expInfo: expInfo,
  resources: [],
});

psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.EXP);

var frameDur;
async function updateInfo() {
  expInfo["date"] = util.MonotonicClock.getDateStr(); // add a simple timestamp
  expInfo["expName"] = expName;
  expInfo["psychopyVersion"] = "2021.2.3";
  expInfo["OS"] = window.navigator.platform;

  // store frame rate of monitor if we can measure it successfully
  expInfo["frameRate"] = psychoJS.window.getActualFrameRate();
  if (typeof expInfo["frameRate"] !== "undefined")
    frameDur = 1.0 / Math.round(expInfo["frameRate"]);
  else frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

  // add info from the URL:
  util.addInfoFromUrl(expInfo);

  return Scheduler.Event.NEXT;
}

var instructionsClock;
var text_2;
var slider;
var polygon;
var key_resp;
var trialClock;
var text;
var key_resp_2;
var globalClock;
var routineTimer;
async function experimentInit() {
  // Initialize components for Routine "instructions"
  instructionsClock = new util.Clock();
  text_2 = new visual.TextStim({
    win: psychoJS.window,
    name: "text_2",
    text: "This is an instructions screen with some extra stuff to demonstrate psychojs working from a custom host",
    font: "Open Sans",
    units: undefined,
    pos: [0, 0],
    height: 0.1,
    wrapWidth: undefined,
    ori: 0.0,
    color: new util.Color("white"),
    opacity: undefined,
    depth: 0.0,
  });

  slider = new visual.Slider({
    win: psychoJS.window,
    name: "slider",
    size: [1.0, 0.1],
    pos: [0, -0.4],
    units: "height",
    labels: undefined,
    ticks: [1, 2, 3, 4, 5],
    granularity: 0.0,
    style: ["RATING"],
    color: new util.Color("LightGray"),
    markerColor: new util.Color("Red"),
    lineColor: new util.Color("White"),
    fontFamily: "Open Sans",
    bold: true,
    italic: false,
    depth: -1,
    flip: false,
  });

  polygon = new visual.ShapeStim({
    win: psychoJS.window,
    name: "polygon",
    vertices: [
      [-[0.5, 0.5][0] / 2.0, -[0.5, 0.5][1] / 2.0],
      [+[0.5, 0.5][0] / 2.0, -[0.5, 0.5][1] / 2.0],
      [0, [0.5, 0.5][1] / 2.0],
    ],
    ori: 0.0,
    pos: [0, 0],
    lineWidth: 1.0,
    lineColor: new util.Color("white"),
    fillColor: new util.Color("white"),
    opacity: undefined,
    depth: -2,
    interpolate: true,
  });

  key_resp = new core.Keyboard({
    psychoJS: psychoJS,
    clock: new util.Clock(),
    waitForStart: true,
  });

  // Initialize components for Routine "trial"
  trialClock = new util.Clock();
  text = new visual.TextStim({
    win: psychoJS.window,
    name: "text",
    text: "Any text\n\nincluding line breaks",
    font: "Open Sans",
    units: undefined,
    pos: [0, 0],
    height: 0.1,
    wrapWidth: undefined,
    ori: 0.0,
    color: new util.Color("white"),
    opacity: undefined,
    depth: 0.0,
  });

  key_resp_2 = new core.Keyboard({
    psychoJS: psychoJS,
    clock: new util.Clock(),
    waitForStart: true,
  });

  // Create some handy timers
  globalClock = new util.Clock(); // to track the time since experiment started
  routineTimer = new util.CountdownTimer(); // to track time remaining of each (non-slip) routine

  return Scheduler.Event.NEXT;
}

var t;
var frameN;
var continueRoutine;
var _key_resp_allKeys;
var instructionsComponents;
function instructionsRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date

    //------Prepare to start Routine 'instructions'-------
    t = 0;
    instructionsClock.reset(); // clock
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // update component parameters for each repeat
    slider.reset();
    key_resp.keys = undefined;
    key_resp.rt = undefined;
    _key_resp_allKeys = [];
    // keep track of which components have finished
    instructionsComponents = [];
    instructionsComponents.push(text_2);
    instructionsComponents.push(slider);
    instructionsComponents.push(polygon);
    instructionsComponents.push(key_resp);

    for (const thisComponent of instructionsComponents)
      if ("status" in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  };
}

function instructionsRoutineEachFrame() {
  return async function () {
    //------Loop for each frame of Routine 'instructions'-------
    // get current time
    t = instructionsClock.getTime();
    frameN = frameN + 1; // number of completed frames (so 0 is the first frame)
    // update/draw components on each frame

    // *text_2* updates
    if (t >= 0.0 && text_2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text_2.tStart = t; // (not accounting for frame time here)
      text_2.frameNStart = frameN; // exact frame index

      text_2.setAutoDraw(true);
    }

    // *slider* updates
    if (t >= 0.0 && slider.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      slider.tStart = t; // (not accounting for frame time here)
      slider.frameNStart = frameN; // exact frame index

      slider.setAutoDraw(true);
    }

    // *polygon* updates
    if (t >= 0.0 && polygon.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      polygon.tStart = t; // (not accounting for frame time here)
      polygon.frameNStart = frameN; // exact frame index

      polygon.setAutoDraw(true);
    }

    // *key_resp* updates
    if (t >= 0.0 && key_resp.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp.tStart = t; // (not accounting for frame time here)
      key_resp.frameNStart = frameN; // exact frame index

      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function () {
        key_resp.clock.reset();
      }); // t=0 on next screen flip
      psychoJS.window.callOnFlip(function () {
        key_resp.start();
      }); // start on screen flip
      psychoJS.window.callOnFlip(function () {
        key_resp.clearEvents();
      });
    }

    if (key_resp.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp.getKeys({
        keyList: ["space"],
        waitRelease: false,
      });
      _key_resp_allKeys = _key_resp_allKeys.concat(theseKeys);
      if (_key_resp_allKeys.length > 0) {
        key_resp.keys = _key_resp_allKeys[_key_resp_allKeys.length - 1].name; // just the last key pressed
        key_resp.rt = _key_resp_allKeys[_key_resp_allKeys.length - 1].rt;
        // a response ends the routine
        continueRoutine = false;
      }
    }

    // check for quit (typically the Esc key)
    if (
      psychoJS.experiment.experimentEnded ||
      psychoJS.eventManager.getKeys({ keyList: ["escape"] }).length > 0
    ) {
      return quitPsychoJS("The [Escape] key was pressed. Goodbye!", false);
    }

    // check if the Routine should terminate
    if (!continueRoutine) {
      // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }

    continueRoutine = false; // reverts to True if at least one component still running
    for (const thisComponent of instructionsComponents)
      if (
        "status" in thisComponent &&
        thisComponent.status !== PsychoJS.Status.FINISHED
      ) {
        continueRoutine = true;
        break;
      }

    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}

function instructionsRoutineEnd() {
  return async function () {
    //------Ending Routine 'instructions'-------
    for (const thisComponent of instructionsComponents) {
      if (typeof thisComponent.setAutoDraw === "function") {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData("slider.response", slider.getRating());
    psychoJS.experiment.addData("slider.rt", slider.getRT());
    psychoJS.experiment.addData("key_resp.keys", key_resp.keys);
    if (typeof key_resp.keys !== "undefined") {
      // we had a response
      psychoJS.experiment.addData("key_resp.rt", key_resp.rt);
      routineTimer.reset();
    }

    key_resp.stop();
    // the Routine "instructions" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();

    return Scheduler.Event.NEXT;
  };
}

var _key_resp_2_allKeys;
var trialComponents;
function trialRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date

    //------Prepare to start Routine 'trial'-------
    t = 0;
    trialClock.reset(); // clock
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // update component parameters for each repeat
    key_resp_2.keys = undefined;
    key_resp_2.rt = undefined;
    _key_resp_2_allKeys = [];
    // keep track of which components have finished
    trialComponents = [];
    trialComponents.push(text);
    trialComponents.push(key_resp_2);

    for (const thisComponent of trialComponents)
      if ("status" in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  };
}

function trialRoutineEachFrame() {
  return async function () {
    //------Loop for each frame of Routine 'trial'-------
    // get current time
    t = trialClock.getTime();
    frameN = frameN + 1; // number of completed frames (so 0 is the first frame)
    // update/draw components on each frame

    // *text* updates
    if (t >= 0.5 && text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text.tStart = t; // (not accounting for frame time here)
      text.frameNStart = frameN; // exact frame index

      text.setAutoDraw(true);
    }

    // *key_resp_2* updates
    if (t >= 0.0 && key_resp_2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp_2.tStart = t; // (not accounting for frame time here)
      key_resp_2.frameNStart = frameN; // exact frame index

      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function () {
        key_resp_2.clock.reset();
      }); // t=0 on next screen flip
      psychoJS.window.callOnFlip(function () {
        key_resp_2.start();
      }); // start on screen flip
      psychoJS.window.callOnFlip(function () {
        key_resp_2.clearEvents();
      });
    }

    if (key_resp_2.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp_2.getKeys({
        keyList: ["space"],
        waitRelease: false,
      });
      _key_resp_2_allKeys = _key_resp_2_allKeys.concat(theseKeys);
      if (_key_resp_2_allKeys.length > 0) {
        key_resp_2.keys =
          _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].name; // just the last key pressed
        key_resp_2.rt = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].rt;
        // a response ends the routine
        continueRoutine = false;
      }
    }

    // check for quit (typically the Esc key)
    if (
      psychoJS.experiment.experimentEnded ||
      psychoJS.eventManager.getKeys({ keyList: ["escape"] }).length > 0
    ) {
      return quitPsychoJS("The [Escape] key was pressed. Goodbye!", false);
    }

    // check if the Routine should terminate
    if (!continueRoutine) {
      // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }

    continueRoutine = false; // reverts to True if at least one component still running
    for (const thisComponent of trialComponents)
      if (
        "status" in thisComponent &&
        thisComponent.status !== PsychoJS.Status.FINISHED
      ) {
        continueRoutine = true;
        break;
      }

    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}

function trialRoutineEnd() {
  return async function () {
    //------Ending Routine 'trial'-------
    for (const thisComponent of trialComponents) {
      if (typeof thisComponent.setAutoDraw === "function") {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData("key_resp_2.keys", key_resp_2.keys);
    if (typeof key_resp_2.keys !== "undefined") {
      // we had a response
      psychoJS.experiment.addData("key_resp_2.rt", key_resp_2.rt);
      routineTimer.reset();
    }

    key_resp_2.stop();
    // the Routine "trial" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();

    return Scheduler.Event.NEXT;
  };
}

function endLoopIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== "undefined") {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        const thisTrial = snapshot.getCurrentTrial();
        if (
          typeof thisTrial === "undefined" ||
          !("isTrials" in thisTrial) ||
          thisTrial.isTrials
        ) {
          psychoJS.experiment.nextEntry(snapshot);
        }
      }
      return Scheduler.Event.NEXT;
    }
  };
}

function importConditions(currentLoop) {
  return async function () {
    psychoJS.importAttributes(currentLoop.getCurrentTrial());
    return Scheduler.Event.NEXT;
  };
}

async function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }
  psychoJS.window.close();
  psychoJS.quit({ message: message, isCompleted: isCompleted });

  return Scheduler.Event.QUIT;
}
