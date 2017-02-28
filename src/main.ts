import * as controls from './controls';
import { World } from './world';

// Using the control events
controls.controlEvents
  .filter(controls.eventIs.waveIn)
  .subscribe(controls.listenPose({
    start() { console.log('We start'); },
    finish() { console.log('We finish'); },
  }));

(new World()).start();
