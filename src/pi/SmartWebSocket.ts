import WebSocket from './WebSocket';
import { Observable } from 'rxjs';

export interface Message {
  [index: string]: any;
}

function awaitWebsocketReady(websocket: WebSocket) {
  return new Promise((resolve, reject) => {
    if (websocket.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    websocket.addEventListener('open', () => {
      resolve();
    });
  });
}

function websocketToObservable<T>(websocket: WebSocket) {
  return new Observable<T>(subscriber => {
    websocket.addEventListener(
      'message',
      (event: MessageEvent) => subscriber.next(JSON.parse(event.data)),
    );
  });
}

/**
 * A smart WebSocket will allow you to enqueue messeges _before_
 * the socket has opened successfully.
 *
 * It will also automatically JSON encode messages sent to it.
 */
export default class SmartWebSocket<T> {
  websocket: WebSocket;
  messageQueue: Message[] = [];
  observable: Observable<T>;

  constructor(websocket: WebSocket) {
    this.websocket = websocket;
    this.observable = websocketToObservable<T>(this.websocket);
    awaitWebsocketReady(this.websocket)
      .then(() => this.flushMessageQueue());
  }

  send(message: Message) {
    /// We only check for a connecting states, as error states
    /// will result in errors that we want to propagate from the
    /// original WebSocket
    if (this.websocket.readyState === WebSocket.CONNECTING) {
      this.messageQueue.push(message);
      return;
    }

    this.sendMessage(message);
  }

  observe() {
    return this.observable;
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      this.sendMessage(this.messageQueue.shift()!);
    }
  }

  private sendMessage(message: Message) {
    this.websocket.send(JSON.stringify(message));
  }
}
