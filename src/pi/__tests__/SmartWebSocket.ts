jest.mock('../WebSocket');

import * as td from 'testdouble';
import WebSocket from '../WebSocket';

import SmartWebSocket from '../SmartWebSocket';

it('JSON encodes messages', () => {
  const socket: any = td.object(['send']);
  socket.readyState = WebSocket.OPEN;
  const smartSocket = new SmartWebSocket(socket);

  smartSocket.send({ foo: 'bar' });
  td.verify(socket.send(JSON.stringify({ foo: 'bar' })));
});

it('queues messages while waiting to connect', () => {
  const socket: any = td.object(['send', 'addEventListener']);
  socket.readyState = WebSocket.CONNECTING;

  let smartSocket: SmartWebSocket<any>;
  let openCallback: Function | undefined;

  td.when(socket.addEventListener('open', td.matchers.isA(Function)))
    .thenDo((eventType: string, callback: Function) => {
      openCallback = callback;
    });

  smartSocket = new SmartWebSocket(socket);
  smartSocket.send({ foo: 'bar' });

  td.verify(socket.send(td.matchers.anything()), { times: 0 });

  socket.readyState = WebSocket.OPEN;

  if (!openCallback) {
    throw new Error('No listener created for socket open');
  }

  openCallback();

  // We wrap the verification in a promise as there is some asynchronisity to account for
  return Promise.resolve()
    .then(() =>
      td.verify(socket.send(JSON.stringify({ foo: 'bar' }))),
    );
});

it('observe() forwards websocket messages', () => {
  const socket: any = td.object(['addEventListener']);
  socket.readyState = WebSocket.OPEN;

  let smartSocket: SmartWebSocket<any>;
  let sendCallback: Function | undefined;

  td.when(socket.addEventListener('message', td.matchers.isA(Function)))
    .thenDo((eventType: string, callback: Function) => {
      sendCallback = callback;
    });

  smartSocket = new SmartWebSocket(socket);

  const messages: any[] = [];
  const subscription = smartSocket
    .observe()
    .subscribe(message => messages.push(message));

  if (!sendCallback) {
    throw new Error('No listener created for socket');
  }

  sendCallback({ data: JSON.stringify({ foo: 'bar' }) });

  expect(messages).toEqual([{ foo: 'bar' }]);

  subscription.unsubscribe();
});
