import SmartWebSocket, { Message } from './SmartWebSocket';
import WebSocket from './WebSocket';
import { Observable } from 'rxjs';

interface ErrorMessage {
  message_type: 'error' | 'syntax_error';
  message: {
    desc: string,
  };
}

interface OscilloscopeMessage {
  message_type: 'scope/amp';
  data: {
    [index: number]: number,
  };
}

type CommunicatorMessage = ErrorMessage | OscilloscopeMessage;

function createDefaultSocket() {
  return new SmartWebSocket<CommunicatorMessage>(new WebSocket(`ws://${window.location.hostname}:9162`));
}

/**
 * Communicates with a server to send messages to Sonic Pi
 */
export default class SonicPiCommunicator {
  private websocket: SmartWebSocket<CommunicatorMessage>;

  constructor(websocket = createDefaultSocket()) {
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

  subscribeToOscilloscopes(scopeIndices: number[]) {
    this.websocket.send({
      command: 'subscribe',
      scopes: scopeIndices,
    });
  }

  /**
   * Observe messages from Sonic Pi
   */
  observe() {
    return this.websocket.observe();
  }

  /**
   * Observe oscilloscope information
   */
  oscData() {
    return this
      .observe()
      .filter((message): message is OscilloscopeMessage => message.message_type === 'scope/amp');
  }

  /**
   * Observe errors from Sonic Pi
   */
  sonicPiErrors() {
    return this
      .observe()
      .filter((message): message is ErrorMessage => message.message_type === 'error' || message.message_type === 'syntax_error');
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
