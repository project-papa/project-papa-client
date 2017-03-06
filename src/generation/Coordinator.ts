import LiveLoop from './LiveLoop';
import SonicPiCommunicator from '../pi/SonicPiCommunicator';
import { getLoopsOfType, LiveLoopCatagory, LiveLoopName } from './directory';
import { Subject, Observable } from 'rxjs';

export default class Coordinator {

  private header: string = '';
  private outputRuby: string;
  private communicator: SonicPiCommunicator = new SonicPiCommunicator();
  private rubyToSend: Subject<string> = new Subject();

  // Define the lists of loop types, and the position in the array
  private catagories: {
    [P in LiveLoopCatagory]: LiveLoopName[];
  } = {
    drums: getLoopsOfType('drums'),
    ambient: getLoopsOfType('ambient'),
    lead: getLoopsOfType('lead'),
    bass: getLoopsOfType('bass'),
    weird: getLoopsOfType('weird'),
  };

  // Store the free number slots
  private freeScopeNums = new Array();
  private usedScopeNums = new Set();

  // Set of active loops
  private activeLoops = new Set<LiveLoop>();

  // List of killed loops
  private deadLoops = new Set<LiveLoop>();

  public constructor() {
    this.communicator.sonicPiErrors().subscribe(
      error => console.error('Sonic Pi error!', error.message),
    );

    this.rubyToSend
      .sample(Observable.interval(500))
      .distinctUntilChanged()
      .subscribe(code => this.runRuby(code));

    // Add the free scope numbers
    for(let i = 1; i < 128; i++) {
      this.freeScopeNums.push(i);
    }

    // Randomise the loops order
    this.catagories.drums.sort((a, b) => { return 0.5 - Math.random(); } );
    this.catagories.ambient.sort((a, b) => { return 0.5 - Math.random(); } );
    this.catagories.weird.sort((a, b) => { return 0.5 - Math.random(); } );
    this.catagories.lead.sort((a, b) => { return 0.5 - Math.random(); } );
    this.catagories.bass.sort((a, b) => { return 0.5 - Math.random(); } );

    // Define the header timing information
    this.header =
    `use_bpm 128
    use_external_synths true

    live_loop :metronome_1 do
      sleep 1
    end

    live_loop :metronome_2 do
      sync :metronome_1
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

    this.updateOscilloscopeSubscriptions();
  }

  public getRuby() { return this.outputRuby; }

  /**
   * Method to return a free scope number to a live loop. Scope numbers are
   * released when a loop is deleted. Sonic Pi can handle a maximum of 128
   * scopes, one of which is used by the global state, so a maximum of 127
   * live loops should be created.
   */
  public getFreeScope() {
    if (this.freeScopeNums.length === 0) {
      throw new Error('Too many loops are active - no free scopes');
    }

    // Declare the scope num as used and return it.
    this.usedScopeNums.add(this.freeScopeNums[0]);
    this.updateOscilloscopeSubscriptions();
    return this.freeScopeNums.shift();
  }

  /**
   * Gets a loop of a certain catagory and makes it so that loop will not
   * be reused until all others of that catagory have been produced.
   */
  public getLoopOfType(catagory: LiveLoopCatagory) {

    // Get a loop to use and move this to be MRU
    const loop : LiveLoopName = this.catagories[catagory].shift()!;
    this.catagories[catagory].push(loop);

    return loop;
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
    this.usedScopeNums.delete(l.getScopeNum());
    this.updateOscilloscopeSubscriptions();
    this.generateRuby();
  }

  /**
   * Adds the header information, followed by each live loop (and their
   * effects) each in turn to create an output string that can be send to
   * Sonic Pi
   */
  public generateRuby() {
    let force = false;
    // Reset the output
    this.outputRuby = '';

    // Add each loop construct
    for (const loop of this.activeLoops) {
      this.outputRuby = this.outputRuby + loop.getRuby() + '\n';
    }

    // Add the header
    this.outputRuby = this.header + '\n' + this.outputRuby;

    // Stop all killed loops
    if (this.deadLoops.size !== 0) {
      force = true;
      // Add each stop
      for (const loop of this.deadLoops) {
        this.outputRuby = this.outputRuby
          + 'live_loop :' + loop.getTag() + ' do\n  stop\nend\n';
      }

      // Reset
      this.deadLoops = new Set<LiveLoop>();
    }

    if (force) {
      this.runRuby(this.outputRuby);
    } else {
      this.rubyToSend.next(this.outputRuby);
    }
  }

  private runRuby(code: string) {
    console.log('Running Ruby ======');
    console.log(code);
    this.communicator.runCode(code);
  }

  public oscilloscopeDataForIndex(scopeNum: number) {
    return this.communicator
      .oscData()
      .map(oscData => oscData.data[scopeNum])
      .filter(amplitude => amplitude !== undefined);
  }

  public globalOscilloscopeData() {
    return this.communicator.oscData()
      .map(oscData => {
        let sum = 0;
        for (const scopeNum of this.usedScopeNums) {
          sum += oscData.data[scopeNum];
        }
        return sum;
      });
  }

  updateOscilloscopeSubscriptions() {
    this.communicator.subscribeToOscilloscopes([...this.usedScopeNums]);
  }

}
