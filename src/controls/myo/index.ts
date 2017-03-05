import Myo = require('myo');
import { Observable, Subject } from 'rxjs';
import * as controller from '../controller';
import * as controlEvents from '../create-control-events';
import { MyoPoseStart, MyoPoseEnd, getPoseStarts, getPoseEnds, getOrientation } from './myo-events';

function myoPoseEvents() {
  return Observable.merge(
    getPoseStarts(),
    getPoseEnds(),
  );
}

interface KeysToNames {
  [index: string]: controller.EventName | undefined;
}

const myoPosesToControlPoses: KeysToNames = {
  fist: 'fist',
  double_tap: 'double-tap',
  fingers_spread: 'spread',
  wave_in: 'wave-in',
  wave_out: 'wave-out',
};

function keysToRawEvents(myoEvents: Observable<MyoPoseStart | MyoPoseEnd>): Observable<controlEvents.RawEvent> {
  return myoEvents.map(event => {
    const eventName = myoPosesToControlPoses[event.name];

    if (eventName === undefined) {
      return { type: 'null' };
    }

    return {
      type: event.type === 'start' ? 'start' : 'end',
      name: eventName,
    };
  });
}

export function streamPosesFromMyo(): controller.EventStream {
  return controlEvents.controlEventsFromRawEvents(keysToRawEvents(myoPoseEvents()));
}

export { getOrientation as streamQuaternions };

const vibrations = new Subject<Myo.VibrateLength>();
vibrations
  .throttleTime(500)
  .subscribe(length => {
    if (Myo.myos.length) {
      Myo.myos[0].vibrate(length);
    }
  });

export function vibrate(length: Myo.VibrateLength) {
  vibrations.next(length);
}
