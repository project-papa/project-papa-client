import SmartWebSocket, { Message } from './SmartWebSocket';
import WebSocket from './WebSocket';

/**
 * Communicates with a server to send messages to Sonic Pi
 */
export default class SonicPiCommunicator {
  private websocket: SmartWebSocket;

  constructor(websocket = new SmartWebSocket(new WebSocket(`ws://${window.location.hostname}:9162`))) {
    this.websocket = websocket;
  }

  /**
   * Stop all running jobs
   */
  stopAllJobs() {
    this.websocket.send({
      command: 'stop-all-jobs',
    });
  }

  /**
   * Run the given Sonic Pi code
   */
  runCode(code: string) {
    this.websocket.send({
      command: 'run-code',
      code,
    });
  }
}

/**
 * Play a song for a bit of fun
 */
export function playSong() {
  const communicator = new SonicPiCommunicator();

  communicator.runCode(`
    use_synth :fm
    play :c
    sleep 1
    play :e
    sleep 1
    sample :loop_amen
  `);
}
