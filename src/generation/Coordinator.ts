import LiveLoop from './LiveLoop';
import Effect from './Effect';
import SonicPiCommunicator from '../pi/SonicPiCommunicator';

export default class Coordinator {

  private header: string = '';
  private outputRuby: string;
  private communicator: SonicPiCommunicator = new SonicPiCommunicator();

  // Set of active loops
  private activeLoops = new Set<LiveLoop>();

  // List of killed loops
  private deadLoops = new Set<LiveLoop>();

  public getRuby() { return this.outputRuby; }

  public constructor() {

    // TODO: set header

  }

  /**
   * Method to add a live loop to the playing music. Provide the name of the
   * loop and this method does lookup for the ruby code. Returns an ID unique
   * to the loop.
   */
  public addLoopToSet(l: LiveLoop){

    // Add the loop to the set of active loops
    this.activeLoops.add(l);

    this.generateRuby();
  }

  /**
   * Removes a live loop with a specified ID, then updates the output.
   */
  public removeLoopFromSet(l: LiveLoop) {

    if (!this.activeLoops.has(l)) {
      throw new Error('Loop tag ' + l.getTag() + ' not present.');
    }

    // Move the loop to be terminated
    this.activeLoops.delete(l);
    this.deadLoops.add(l);

    this.generateRuby();
  }

  /**
   * Adds the header information, followed by each live loop (and their
   * effects) each in turn to create an output string that can be send to
   * Sonic Pi
   */
  public generateRuby() {

    // Define a string as the output ruby, and initialise with the header
    this.outputRuby = this.header + '\n';

    // Add each loop construct
    for (const loop of this.activeLoops) {
      this.outputRuby = this.outputRuby + loop.getRuby() + '\n';
    }

    // Stop all killed loops
    if (this.deadLoops.size !== 0) {

      // Add each stop
      for (const loop of this.deadLoops) {
        this.outputRuby = this.outputRuby
          + 'live_loop :' + loop.getTag() + ' do\n  stop\nend\n';
      }

      // Reset
      this.deadLoops = new Set<LiveLoop>();
    }

    this.communicator.runCode(this.outputRuby);
  }

}
