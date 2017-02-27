import { polyfill } from 'keyboardevent-key-polyfill';
import { Observable } from 'rxjs';
polyfill();

export interface KeyDown {
  type: 'down';
  key: string;
}

export interface KeyUp {
  type: 'up';
  key: string;
}

export function getDownKeys(element: Node) {
  return Observable.fromEvent<KeyboardEvent>(element, 'keydown')
    .map<KeyboardEvent, KeyDown>(event => ({ type: 'down', key: event.key }));
}

export function getUpKeys(element: Node) {
  return Observable.fromEvent<KeyboardEvent>(element, 'keyup')
    .map<KeyboardEvent, KeyUp>(event => ({ type: 'up', key: event.key }));
}
