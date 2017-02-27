import { polyfill as keyEventPolyfill } from 'keyboardevent-key-polyfill';
import { Observable } from 'rxjs';

keyEventPolyfill();

export type EventName = 'fist' | 'spread' | 'double-tap' | 'wave-in' | 'wave-out';

interface PoseEvent<T extends EventName> {
  type: T;
  observe(): Observable<any>;
}

export interface FistEvent extends PoseEvent<'fist'> { }

export interface SpreadEvent extends PoseEvent<'spread'> { }

export interface DoubleTapEvent extends PoseEvent<'double-tap'> { }

export interface WaveInEvent extends PoseEvent<'wave-in'> { }

export interface WaveOutEvent extends PoseEvent<'wave-out'> { }

export type ControlEvent = PoseEvent<EventName>;

export type EventStream = Observable<PoseEvent<EventName>>;

export const eventIs = {
  fist(event: ControlEvent): event is FistEvent {
    return event.type === 'fist';
  },
  spread(event: ControlEvent): event is SpreadEvent {
    return event.type === 'spread';
  },
  doubleTap(event: ControlEvent): event is DoubleTapEvent {
    return event.type === 'double-tap';
  },
  waveIn(event: ControlEvent): event is WaveInEvent {
    return event.type === 'wave-in';
  },
  waveOut(event: ControlEvent): event is WaveOutEvent {
    return event.type === 'wave-out';
  },
};

type PoseListener = {
  start(): void,
  finish?(): void,
};

/**
 * Returns a function that you can use as a subscriber to listen for starts and stops
 * of poses
 */
export function listenPose({ start, finish }: PoseListener) {
  return (event: ControlEvent) => {
    start();

    if (finish) {
      event.observe().subscribe({
        complete() { finish(); },
      });
    }
  };
}
