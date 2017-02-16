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

export function keyboardInput(event: KeyboardEvent) {
  switch (event.keyCode) {
  // Key 1
  case 49:
    armUp();
    break;
  // Key 2
  case 50:
    armDown();
    break;
  // Key 3
  case 51:
    punchUp();
    break;
  // Key 4
  case 52:
    punchOut();
    break;
  // Key 5
  case 53:
    anticlockwiseRoll();
    break;
  // Key 6
  case 54:
    clockwiseRoll();
    break;
  // Key 7
  case 55:
    anticlockwiseYaw();
    break;
  // Key 8
  case 56:
    clockwiseYaw();
    break;
  // Key a
  case 65:
    waveIn();
    break;
  // Key b
  case 66:
    waveOut();
    break;
  // Key c
  case 67:
    fingersSpread();
    break;
  // Key d
  case 68:
    fist();
    break;
  // Key e
  case 69:
    doubleTap();
    break;
  default:
    return;
  }
}
