import { Observable } from 'rxjs';
import { EventStream } from './controller';
import { default as streamKeyboardFromElement } from './keyboard';

export const controlEvents: EventStream = Observable.merge(
  streamKeyboardFromElement(document).share(),
);

export * from './controller';
