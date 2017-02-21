import Myo = require('myo');

let deltaPitch = 0;
let oldPitch = 0;
let pitch = 0;

let oldRoll = 0;
let deltaRoll = 0;
let roll = 0;

let oldYaw = 0;
let deltaYaw = 0;
let yaw = 0;

let accelX = 0;
let accelY = 0;
let accelZ = 0;

let punchupTime = 0;
let punchoutTime = 0;

function armUp() {
  console.log('arm up');
}

function armDown() {
  console.log('arm down');
}

function punchUp() {
  console.log('punch up');
}

function punchOut() {
  console.log('punch out');
}

function anticlockwiseRoll() {
  console.log('anticlockwise roll');
}

function clockwiseRoll() {
  console.log('clockwise roll');
}

function anticlockwiseYaw() {
  console.log('anticlockwise yaw');
}

function clockwiseYaw() {
  console.log('clockwise yaw');
}

function waveIn() {
  console.log('wave in');
}

function waveOut() {
  console.log('wave out');
}

function fingersSpread() {
  console.log('fingers spread');
}

function fist() {
  console.log('fist');
}

function doubleTap() {
  console.log('double tap');
}

Myo.connect('com.project-papa.vr');

Myo.on('connected', () => {
  Myo.setLockingPolicy('none');
  setInterval(() => {
    deltaPitch = pitch - oldPitch;
    if (pitch > 1 && deltaPitch > 1) {
      armUp();
    } else if (pitch < 0.5 && deltaPitch < -1) {
      armDown();
    }
    oldPitch = pitch;
  }, 500);
  // May need to reserve a pose for these, eg fingers spread. to avoid accidental triggering on pose edge
  setInterval(() => {
    const time = (new Date()).getTime();
    if (punchupTime < time - 1000 && accelX < -1 && pitch > 0.7 && deltaPitch < 0.1) {
      punchUp();
      punchupTime = time;
    }
  }, 100);
  // This is a punch out, can be front or to the side
  setInterval(() => {
    const time = (new Date()).getTime();
    if (punchoutTime < time - 1000 && accelX < -1 && pitch < 0.5) {
      punchOut();
      punchoutTime = time;
    }
  }, 100);

  setInterval(() => {
    deltaRoll = roll - oldRoll;
    if (deltaPitch < 0.1 && pitch < 0.5) {
      if (roll > 0 && oldRoll < 0) {
        if (deltaRoll > 2.5) {
          clockwiseRoll();
        } else if (deltaRoll > 1) {
          anticlockwiseRoll();
        }
      } else if (roll < 0 && oldRoll > 0) {
        if (deltaRoll < -2.5) {
          anticlockwiseRoll();
        } else if (deltaRoll < -1) {
          clockwiseRoll();
        }
      } else if (deltaRoll > 1) {
        anticlockwiseRoll();
      } else if (deltaRoll < -1) {
        clockwiseRoll();
      }
    }

    oldRoll = roll;

  }, 200);

  setInterval(() => {
    deltaYaw = yaw - oldYaw;
    if (deltaPitch < 0.1 && pitch < 0.5) {
      if (yaw > 0 && oldYaw < 0) {
        if (deltaYaw > 3) {
          clockwiseYaw();
        } else if (deltaYaw > 1) {
          anticlockwiseYaw();
        }
      } else if (yaw < 0 && oldYaw > 0) {
        if (deltaYaw < -3) {
          anticlockwiseYaw();
        } else if (deltaYaw < -1) {
          clockwiseYaw();
        }
      } else if (deltaYaw > 1) {
        anticlockwiseYaw();
      } else if (deltaYaw < -1) {
        clockwiseYaw();
      }
      oldYaw = yaw;
    }
  }, 400);

});

Myo.on('wave_in', edge => {
  if (edge) {
    waveIn();
  }
});

Myo.on('wave_out', edge => {
  if (edge) {
    waveOut();
  }
});

Myo.on('fist', edge => {
  if (edge) {
    fist();
  }
});

Myo.on('double_tap', edge => {
  if (edge) {
    doubleTap();
  }
});

Myo.on('fingers_spread', edge => {
  if (edge) {
    fingersSpread();
  }
});

Myo.on('orientation', data => {
  if (oldRoll === 0) {
    oldRoll = getRoll(data);
  }
  if (oldYaw === 0) {
    oldYaw = getYaw(data);
  }
  roll = getRoll(data);
  pitch = getPitch(data);
  yaw = getYaw(data);
});

Myo.on('accelerometer', data => {
  accelX = data.x;
  accelY = data.y;
  accelZ = data.z;
});

function getRoll(data: { x: number, y: number, z: number, w: number }) {
  const result = Math.atan2(2.0 * (data.w * data.x + data.y * data.z), 1.0 - 2.0 * (data.x * data.x + data.y * data.y));
  return result;
}

// Ranges from -PI/2 (arm down) to PI/2 (arm up)
function getPitch(data: { x: number, y: number, z: number, w: number }) {
  const result = Math.asin(Math.max(-1.0, Math.min(1.0, 2.0 * (data.w * data.y - data.z * data.x))));
  return result;
}

// Ranges from -PI to PI (whole circle)
function getYaw(data: { x: number, y: number, z: number, w: number }) {
  const result = Math.atan2(2.0 * (data.w * data.z + data.x * data.y), 1.0 - 2.0 * (data.y * data.y + data.z * data.z));
  return result;
}
