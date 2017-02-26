import { Observable } from 'rxjs';
import { EventStream } from './controller';
import streamKeyboardFromElement from './keyboard';
import streamMyo from './myo';

export const controlEvents: EventStream = Observable.merge(
  streamKeyboardFromElement(document).share(),
  streamMyo().share(),
);

export * from './controller';
