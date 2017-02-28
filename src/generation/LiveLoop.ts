import Effect from './Effect';
import Coordinator from './Coordinator';
import { getRubyForLiveLoop, LiveLoopName } from './directory';

export default class LiveLoop {

  private readonly rawRuby: string;
  private readonly name: string;
  private volume: number;
  private outputRuby: string;
  private id: number;
  private tag: string;
  private readonly scopeNum: number;
  private static idCount: number = 0;
  private static coordinator = new Coordinator();

  /**
   * Store a list of effects applied to the live loop.
   * Note that there is a notion of hierarchy - effects at the beginning
   * of the list will be applied first, with those that follow being applied
   * in succession. Also store a map of ID ints to the effects stored, for
   * easy lookup.
   */
  private effectsHeirarchy: Array<Effect>;
  private activeEffects: Set<Effect>;

  public constructor(name: LiveLoopName) {

    this.scopeNum = LiveLoop.coordinator.getFreeScope();

    // Get the ruby for this type of loop
    const rawRuby = getRubyForLiveLoop(name);

    // Get a unique ID for this loop and generate the tag
    this.id = LiveLoop.idCount++;
    this.tag = 'Loop_' + this.id + '_' + name;

    // Initialise the internal store of the effects
    this.effectsHeirarchy = [];
    this.activeEffects = new Set<Effect>();

    // Convert the ruby into the form of a loop
    this.rawRuby = 'live_loop :'+this.tag+' do\n'+rawRuby+'\nend';

    this.generateRuby();

    LiveLoop.coordinator.addLoopToSet(this);
  }

  public getTag() { return this.tag; }

  public getScopeNum() { return this.scopeNum; }

  public getActiveEffects() { return this.activeEffects; }

  public getRuby() { return this.outputRuby; }

  public setVolume(v: number) {
    // TODO sanity check v
    this.volume = v;
  }

  /**
   * Takes an argument that is the name of a defined effect, and creates a new
   * effect object. New effects are applied to the live loop last. Then Pushes
   * the update to the coordinator, and return the ID.
   */
  public addEffectToSet(e: Effect) {

    // Add it to the internal store
    this.activeEffects.add(e);
    this.effectsHeirarchy.push(e);

    this.generateAndPushRuby();

  }

  /**
   * Removes an effect with a specified ID (unique this this liveloop). Then
   * pushes this update to the coordinator.
   */
  public removeEffectFromSet(e: Effect) {

    if (!this.activeEffects.has(e)) {
      throw new Error('Effect not present.');
    }

    // Get the index of the specified effect
    const index = this.effectsHeirarchy.indexOf(e);

    // Test if the effect was present
    if (index < 0) {
      throw new Error('Effect not present in hierarchy.');
    }

    // Remove the specified effect from both storage sections
    this.effectsHeirarchy.splice(index, 1);
    this.activeEffects.delete(e);

    this.generateAndPushRuby();
  }

  /**
   * Adds each effect in turn to the underlying raw ruby code that defines this
   * live loop. DOES NOT push the update to the coordinator.
   */
  public generateRuby() {

    // Reset the output
    this.outputRuby = this.rawRuby;

    // Add each effect in order
    for(let i = 0; i < this.effectsHeirarchy.length; i++) {
      this.outputRuby =
        this.effectsHeirarchy[i].getRuby() + '\n' + this.outputRuby + '\nend';
    }

    // TODO set vol wrapper

    // Add the  oscilliscope data wrapper
    this.outputRuby = 'with_fx \"sonic-pi-fx_scope_out\", scope_num: '
                    + this.scopeNum + ' do\n' + this.outputRuby + '\nend\n';
  }

  /**
   * Similar to generateRuby, but pushes this update to the coordinator.
   */
  public generateAndPushRuby() {
    this.generateRuby();
    LiveLoop.coordinator.generateRuby();
  }

  /**
   * Method for deleting this LiveLoop from the playing set. Once a LiveLoop
   * has been deleted, it should not be readded, and should instead be left
   * for garbage collection.
   */
  public delete() {
    LiveLoop.coordinator.removeLoopFromSet(this);
  }

  oscilloscopeData() {
    return LiveLoop.coordinator.oscilloscopeDataForIndex(this.scopeNum);
  }

  static globalOscilloscopeData() {
    return this.coordinator.globalOscilloscopeData();
  }
}

/**
 * Example of subscribing to a live loop
 */
function subscribeToLiveLoop() {
  (new LiveLoop('weird_vinyl')).oscilloscopeData().subscribe(
    number => {
      console.log(number);
    },
  );
}
