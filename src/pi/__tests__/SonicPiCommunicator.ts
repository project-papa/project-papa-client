jest.mock('../WebSocket');

import * as td from 'testdouble';

import SonicPiCommunicator from '../SonicPiCommunicator';
import WebSocket from '../WebSocket';

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
