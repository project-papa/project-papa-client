import LiveLoop from './LiveLoop';
import Effect from './Effect';

export default class Coordinator {

  private header: string;
  private loopsIdCount: number;
  private outputRuby: string;

  // Directory of loop names to their underlying ruby code
  private loopsDirectory: { [name: string] : string };

  // Directory of effect names to their adjustable settings
  private effectsDirectory: { [name: string] : { [parameter : string] : number} };

  // Set of active loops each with a unique ID
  private activeLoops: { [id: number] : LiveLoop };

  public getLoopsDirectory() {return this.loopsDirectory; }

  public getEffectsDirectory() {return this.effectsDirectory; }

  public getRuby() { return this.outputRuby; }

  private getLiveLoop(loopId: number) {
    if (!this.activeLoops.hasOwnProperty(loopId)) {
      throw new Error('Loop ID ' + loopId + ' not present.');
    }
    return this.activeLoops[loopId];
  }

  public constructor() {
    this.loopsIdCount = 0;

    this.loopsDirectory = {};
    this.effectsDirectory = {};
    // TODO: define default loops & effects

    // TODO: set header
  }

  /*
   * Method to define a new live loop for use in the music creation. Takes a
   * name and a ruby string. The ruby string should be solely the contents of
   * the live loop, without any live loop declaration.
   */
  public defineLiveLoop(name: string, rawRuby: string) {
    this.loopsDirectory[name] = rawRuby;
  }

  /*
   * Method to define a new effect for use in the music creation. Takes a
   * name and a set of parameter that apply to that effect, along with their
   * default values.
   */
  public defineEffect(name: string, parameters: { [parameter : string] : number}) {
    this.effectsDirectory[name] = parameters;
  }

  /*
   * Method to add a live loop to the playing music. Provide the name of the
   * loop and this method does lookup for the ruby code. Returns an ID unique
   * to the loop.
   */
  public addLiveLoop(loopName: string){

    if (!this.loopsDirectory.hasOwnProperty(loopName)) {
      throw new Error('Loop with name ' + loopName + ' has not been defined.');
    }

    // Get the ruby for this type of loop
    const rawRuby = this.loopsDirectory[loopName];

    // Get a unique ID for this loop
    const loopId = this.loopsIdCount;
    this.loopsIdCount += 1;

    // Create the new loop and add it to the set of active loops
    this.activeLoops[loopId] = new LiveLoop(name, rawRuby, loopId, this);
    this.generateRuby();

    // Return the ID
    return loopId;
  }

  /*
   * Removes a live loop with a specified ID, then updates the output.
   */
  public removeLiveLoop(loopId: number) {
    if (!this.activeLoops.hasOwnProperty(loopId)) {
      throw new Error('Loop ID ' + loopId + ' not present.');
    }
    delete this.activeLoops[loopId];
    this.generateRuby();
  }

  /*
   * Adds the header information, followed by each live loop (and their
   * effects) each in turn to create an output string that can be send to
   * Sonic Pi
   */
  public generateRuby() {

    // Define a string as the output ruby, and initialise with the header
    this.outputRuby = this.header + '\n';

    // Something to store each live loop in turn
    let liveLoop;

    // Add each loop construct
    for (const loopId in this.activeLoops) {
      if (this.activeLoops.hasOwnProperty(loopId)) {
        liveLoop = this.activeLoops[loopId];
        this.outputRuby = this.outputRuby + liveLoop.getRuby() + '\n';
      }
    }

  }

}
