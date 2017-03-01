import LiveLoop from './LiveLoop';
import SonicPiCommunicator from '../pi/SonicPiCommunicator';

export default class Coordinator {

  private header: string = '';
  private outputRuby: string;
  private communicator: SonicPiCommunicator = new SonicPiCommunicator();

  // List of free num slots
  private freeScopeNums = new Array();

  // Set of active loops
  private activeLoops = new Set<LiveLoop>();

  // List of killed loops
  private deadLoops = new Set<LiveLoop>();

  public constructor() {

    // Add the free scope numbers
    for(let i = 2; i < 128; i++) {
      this.freeScopeNums[i] = i;
    }

    // Define the header timing information
    this.header =
    `use_bpm 100

    live_loop :metronome_2 do
      sleep 2
    end

    live_loop :metronome_4 do
      sync :metronome_2
      with_fx :level, amp: 0.5 do
        use_synth :chipbass
        play 110, amp: 5, release: 0.02
        sleep 1
        play 90, release: 0.01
        sleep 1
        play 90, release: 0.01
        sleep 1
        play 90, release: 0.01
        sleep 1
      end
    end

    live_loop :metronome_8 do
      sync :metronome_4
      sleep 8
    end`;

  }

  public getRuby() { return this.outputRuby; }

  /**
   * Method to return a free scope number to a live loop. Scope numbers are
   * released when a loop is deleted. Sonic Pi can handle a maximum of 128
   * scopes, two of which are used by the global state, so a maximum of 126
   * live loops should be created.
   */
  public getFreeScope() {
    if (this.freeScopeNums.length === 0) {
      throw new Error('Too many loops are active - no free scopes');
    }
    return this.freeScopeNums.shift();
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

    // Free up the scope num
    this.freeScopeNums.push(l.getScopeNum());

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

    // Add global scope number 1
    this.outputRuby = 'with_fx \"sonic-pi-fx_scope_out\", scope_num: 1 do\n'
                      + this.outputRuby + '\nend\n';

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
