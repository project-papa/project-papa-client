/**
 * Communicates with a server to send messages to Sonic Pi
 */
export default class SonicPiCommunicator {
  private websocket: WebSocket;

  constructor(websocket = new WebSocket(`ws://${window.location.host}:9162`)) {
    this.websocket = websocket;
  }

  /**
   * Stop all running jobs
   */
  stopAllJobs() {
    this.websocket.send(JSON.stringify({
      command: 'stop-all-jobs',
    }));
  }

  /**
   * Run the given Sonic Pi code
   */
  runCode(code: string) {
    this.websocket.send(JSON.stringify({
      command: 'run-code',
      code,
    }));
  }
}
