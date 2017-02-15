import SonicPiCommunicator from '../SonicPiCommunicator';
import * as td from 'testdouble';

it('should stop all jobs when called', () => {
  const socket: any = td.object(['send']);
  const communicator = new SonicPiCommunicator(socket);

  communicator.stopAllJobs();

  td.verify(socket.send(JSON.stringify({ command: 'stop-all-jobs' })));
});

it('should run code when called', () => {
  const socket: any = td.object(['send']);
  const communicator = new SonicPiCommunicator(socket);

  communicator.runCode('print "hello"');

  td.verify(socket.send(JSON.stringify({
    command: 'run-code',
    code: 'print "hello"',
  })));
});
