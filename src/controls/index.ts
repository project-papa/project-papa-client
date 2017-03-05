import { Observable } from 'rxjs';
import { EventStream } from './controller';
import { streamPosesForKeyboard } from './keyboard';
import { streamPosesFromMyo, streamQuaternions as streamQuaternionsfromMyo } from './myo';
import { quaternionsToOrientations } from './orientation';

export const controlEvents: EventStream = Observable.merge(
  streamPosesForKeyboard(document).share(),
  streamPosesFromMyo().share(),
);

export const orientationEvents = quaternionsToOrientations(streamQuaternionsfromMyo()).share();

export * from './controller';
