import { Observable } from 'rxjs';
import { EventStream } from './controller';
import { streamPosesForKeyboard } from './keyboard';
import { streamPosesFromMyo, streamQuaternions as streamQuaternionsfromMyo } from './myo';

export const controlEvents: EventStream = Observable.merge(
  streamPosesForKeyboard(document).share(),
  streamPosesFromMyo().share(),
);

export const orientationEvents = streamQuaternionsfromMyo().publish();
orientationEvents.connect();

export * from './controller';
