import { Observable } from 'rxjs';
import * as controller from '../controller';
import * as controlEvents from '../create-control-events';
import { MyoPoseStart, MyoPoseEnd, getPoseStarts, getPoseEnds } from './myo-events';

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

export default function streamFromMyo(): controller.EventStream {
  return controlEvents.controlEventsFromRawEvents(keysToRawEvents(myoPoseEvents()));
}
