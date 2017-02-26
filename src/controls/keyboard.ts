import { Observable } from 'rxjs';
import * as controller from './controller';
import { KeyUp, KeyDown, getDownKeys, getUpKeys } from './document-keyboard-events';

function keyboardEvents(element: Node) {
  return Observable.merge(
    getDownKeys(element),
    getUpKeys(element),
  );
}

function createStreamForKey<T extends controller.ControlEvent>(key: string, constructor: (onComplete: Observable<any>) => T, keyEvents: Observable<KeyDown | KeyUp>) {
  const keyStream = keyEvents
    .filter(event => event.key === key)
    .distinctUntilChanged((event1, event2) => event1.type === event2.type);

  return keyStream
    .filter(event => event.type === 'down')
    .map(event => {
      const finished = keyStream.filter(event => event.type === 'up')
        .first()
        .ignoreElements();

      return constructor(finished);
    });
}

export default function streamFromElement(element: Node): controller.EventStream {
  const keyEvents = keyboardEvents(element);

  return Observable.merge(
    createStreamForKey<controller.FistEvent>(
      'q',
      onComplete => ({ type: 'fist', observe: () => onComplete }),
      keyEvents,
    ),
    createStreamForKey<controller.DoubleTapEvent>(
      'w',
      onComplete => ({ type: 'double-tap', observe: () => onComplete }),
      keyEvents,
    ),
    createStreamForKey<controller.SpreadEvent>(
      'e',
      onComplete => ({ type: 'spread', observe: () => onComplete }),
      keyEvents,
    ),
    createStreamForKey<controller.WaveInEvent>(
      'r',
      onComplete => ({ type: 'wave-in', observe: () => onComplete }),
      keyEvents,
    ),
    createStreamForKey<controller.WaveOutEvent>(
      't',
      onComplete => ({ type: 'wave-out', observe: () => onComplete }),
      keyEvents,
    ),
  );
}
