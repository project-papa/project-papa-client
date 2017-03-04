import { Observable } from 'rxjs';
import * as controller from '../controller';
import * as controlEvents from '../create-control-events';
import { KeyUp, KeyDown, getDownKeys, getUpKeys } from './document-keyboard-events';

function keyboardEvents(element: Node) {
  return Observable.merge(
    getDownKeys(element),
    getUpKeys(element),
  );
}

interface KeysToNames {
  [index: string]: controller.EventName | undefined;
}

const keysToNames: KeysToNames = {
  q: 'fist',
  w: 'double-tap',
  e: 'spread',
  r: 'wave-in',
  t: 'wave-out',
};

function keysToRawEvents(keyEvents: Observable<KeyDown | KeyUp>): Observable<controlEvents.RawEvent> {
  return keyEvents.map(keyEvent => {
    const eventName = keysToNames[keyEvent.key];

    if (eventName === undefined) {
      return { type: 'null' };
    }

    return {
      type: keyEvent.type === 'down' ? 'start' : 'end',
      name: eventName,
    };
  });
}

export function streamPosesForKeyboard(element: Node): controller.EventStream {
  return controlEvents.controlEventsFromRawEvents(keysToRawEvents(keyboardEvents(element)));
}
