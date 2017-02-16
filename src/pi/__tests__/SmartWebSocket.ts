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

  let smartSocket: SmartWebSocket;
  let openCallback: Function = () => 0;

  td.when(socket.addEventListener('open', td.matchers.isA(Function)))
    .thenDo((eventType: string, callback: Function) => {
      openCallback = callback;
    });

  smartSocket = new SmartWebSocket(socket);
  smartSocket.send({ foo: 'bar' });

  td.verify(socket.send(td.matchers.anything()), { times: 0 });

  socket.readyState = WebSocket.OPEN;
  openCallback();

  // We wrap the verification in a promise as there is some asynchronisity to account for
  return Promise.resolve()
    .then(() =>
      td.verify(socket.send(JSON.stringify({ foo: 'bar' }))),
    );
});
