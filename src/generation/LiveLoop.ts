import Coordinator from './Coordinator';
import { getRubyForLiveLoop, LiveLoopName, getEffect } from './directory';

export default class LiveLoop {

  private readonly rawRuby: string;
  private readonly name: string;
  private volume: number = 1;
  private outputRuby: string;
  private id: number;
  private tag: string;
  private effectNum: number = 0;
  private effectData = getEffect(0);
  private readonly scopeNum: number;
  private static idCount: number = 0;
  private static coordinator = new Coordinator();

  public constructor(name: LiveLoopName) {

    this.scopeNum = LiveLoop.coordinator.getFreeScope();

    // Get the ruby for this type of loop
    const rawRuby = getRubyForLiveLoop(name);

    // Get a unique ID for this loop and generate the tag
    this.id = LiveLoop.idCount++;
    this.tag = 'loop_' + this.id + '_' + name;

    // Convert the ruby into the form of a loop
    this.rawRuby = 'live_loop :'+this.tag+' do\n'+rawRuby+'\nend';

    this.generateRuby();

    LiveLoop.coordinator.addLoopToSet(this);
  }

  public getTag() { return this.tag; }

  public getScopeNum() { return this.scopeNum; }

  public getRuby() { return this.outputRuby; }

  public getEffectData() { return this.effectData; }

  /**
   * Set volume method that restricts any input into the range of 0-1
   */
  public setVolume(v: number) {
    if (v < 0) {
      this.volume = 0;
    } else if (v > 1) {
      this.volume = 1;
    } else {
      this.volume = v;
    }
  }

  // TODO def an effectNum type in directory that is intrinsically in range 0-5
  public nextEffect() {
    this.effectNum = (this.effectNum + 1) % 6;
    this.generateAndPushRuby();
  }

  public prevEffect() {
    this.effectNum = (this.effectNum - 1) % 6;
    this.generateAndPushRuby();
  }

  /**
   * Adds the applied effect, volume, and osc data reader wrappers.
   * DOES NOT push the update to the coordinator.
   */
  public generateRuby() {

    // Reset the output
    this.outputRuby = this.rawRuby;

    // Get the information about the effect
    this.effectData = getEffect(this.effectNum);

    // Add the effect
    this.outputRuby = 'with_fx :' + this.effectData.name // TODO add parameters
                    + ' do\n' + this.outputRuby + '\nend\n';

    // Add the vol wrapper
    this.outputRuby = 'with_fx :level, amp: ' + this.volume
                    + ' do\n' + this.outputRuby + '\nend\n';

    // Add the oscilliscope data wrapper
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
