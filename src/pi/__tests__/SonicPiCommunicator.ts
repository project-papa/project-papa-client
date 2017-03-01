jest.mock('../WebSocket');

import * as td from 'testdouble';
import { Observable } from 'rxjs';

import SonicPiCommunicator from '../SonicPiCommunicator';
import WebSocket from '../WebSocket';

const mockSonicPiMessage = {
  type: 'sonic-pi',
  message: {
    messageType: 'foo',
  },
};

const mockOscMessage = {
  type: 'osc',
  oscData: [],
};

const mockOutput = Observable.from([mockSonicPiMessage, mockOscMessage]);

it('should stop all jobs when called', () => {
  const socket: any = td.object(['send']);
  const communicator = new SonicPiCommunicator(socket);

  communicator.stopAllJobs();

  td.verify(socket.send({ command: 'stop-all-jobs' }));
});

it('should run code when called', () => {
  const socket: any = td.object(['send']);
  const communicator = new SonicPiCommunicator(socket);

  communicator.runCode('print "hello"');

  td.verify(socket.send({
    command: 'run-code',
    code: 'print "hello"',
  }));
});

it('should pass emissions from websocket', async () => {
  const socket: any = td.object(['observe']);
  const communicator = new SonicPiCommunicator(socket);
  td.when(socket.observe()).thenReturn(mockOutput);

  const result = await communicator.observe().toArray().toPromise();

  expect(result).toEqual(
    [mockSonicPiMessage, mockOscMessage],
  );
});

it('should filter sonic pi messages correctly', async () => {
  const socket: any = td.object(['observe']);
  const communicator = new SonicPiCommunicator(socket);
  td.when(socket.observe()).thenReturn(mockOutput);

  const result = await communicator.sonicPiMessages().toArray().toPromise();

  expect(result).toEqual(
    [mockSonicPiMessage],
  );
});

it('should filter oscilloscope messages correctly', async () => {
  const socket: any = td.object(['observe']);
  const communicator = new SonicPiCommunicator(socket);
  td.when(socket.observe()).thenReturn(mockOutput);

  const result = await communicator.oscData().toArray().toPromise();

  expect(result).toEqual(
    [mockOscMessage],
  );
});
