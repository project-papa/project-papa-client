jest.mock('../WebSocket');

import * as td from 'testdouble';
import { Observable } from 'rxjs';

import SonicPiCommunicator from '../SonicPiCommunicator';
import WebSocket from '../WebSocket';

const mockErrorMessage = {
  message_type: 'error',
  message: { },
};

const mockOscMessage = {
  message_type: 'scope/amp',
  data: {
    1: 0.4,
  },
};

const mockOutput = Observable.from([mockErrorMessage, mockOscMessage]);

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

it('should subscribe when called', () => {
  const socket: any = td.object(['send']);
  const communicator = new SonicPiCommunicator(socket);

  communicator.subscribeToOscilloscopes([1, 2, 3]);

  td.verify(socket.send({
    command: 'subscribe',
    scopes: [1, 2, 3],
  }));
});

it('should pass emissions from websocket', async () => {
  const socket: any = td.object(['observe']);
  const communicator = new SonicPiCommunicator(socket);
  td.when(socket.observe()).thenReturn(mockOutput);

  const result = await communicator.observe().toArray().toPromise();

  expect(result).toEqual(
    [mockErrorMessage, mockOscMessage],
  );
});

it('should filter sonic pi messages correctly', async () => {
  const socket: any = td.object(['observe']);
  const communicator = new SonicPiCommunicator(socket);
  td.when(socket.observe()).thenReturn(mockOutput);

  const result = await communicator.sonicPiErrors().toArray().toPromise();

  expect(result).toEqual(
    [mockErrorMessage],
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
