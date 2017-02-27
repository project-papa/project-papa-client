/**
 * @module Specifies how to create control events from lower-level events
 */

import * as controller from './controller';
import { Observable } from 'rxjs';

export interface PoseStartEvent {
  type: 'start';
  name: controller.EventName;
}

export interface PoseEndEvent {
  type: 'end';
  name: controller.EventName;
}

export interface NullEvent {
  type: 'null';
}

export type RawEvent = PoseStartEvent | PoseEndEvent | NullEvent;

function rawEventsToLifetimeEvents<T extends controller.ControlEvent>(name: controller.EventName, constructor: (onComplete: Observable<any>) => T) {
  return (rawEvents: Observable<RawEvent>) => {
    const distinctEvents = rawEvents
      .filter((event): event is (PoseStartEvent | PoseEndEvent) => event.type !== 'null')
      .filter(event => event.name === name)
      .distinctUntilChanged((event1, event2) => event1.type === event2.type);

    return distinctEvents
      .filter(event => event.type === 'start')
      .map(event => {
        const finished = distinctEvents.filter(event => event.type === 'end')
          .first()
          .ignoreElements();

        return constructor(finished);
      });
  };
}

export function controlEventsFromRawEvents(events: Observable<RawEvent>) {
  return Observable.merge(
    events.let(rawEventsToLifetimeEvents<controller.FistEvent>(
      'fist',
      onComplete => ({ type: 'fist', observe: () => onComplete }),
    )),
    events.let(rawEventsToLifetimeEvents<controller.DoubleTapEvent>(
      'double-tap',
      onComplete => ({ type: 'double-tap', observe: () => onComplete }),
    )),
    events.let(rawEventsToLifetimeEvents<controller.SpreadEvent>(
      'spread',
      onComplete => ({ type: 'spread', observe: () => onComplete }),
    )),
    events.let(rawEventsToLifetimeEvents<controller.WaveInEvent>(
      'wave-in',
      onComplete => ({ type: 'wave-in', observe: () => onComplete }),
    )),
    events.let(rawEventsToLifetimeEvents<controller.WaveOutEvent>(
      'wave-out',
      onComplete => ({ type: 'wave-out', observe: () => onComplete }),
    )),
  );
}
