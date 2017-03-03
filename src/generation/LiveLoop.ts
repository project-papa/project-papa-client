import Coordinator from './Coordinator';
import { getRubyForLiveLoop, LiveLoopName, getEffect, getNumberOfEffects, LiveLoopCatagory } from './directory';

export default class LiveLoop {

  private readonly rawRuby: string;
  private readonly name: LiveLoopName;
  private volume: number = 1;
  private outputRuby: string;
  private readonly id: number;
  private readonly tag: string;
  private effectNum: number = 0;
  private effectData = getEffect(0);
  private static readonly numOfEffects: number = getNumberOfEffects();
  private readonly scopeNum: number;
  private static idCount: number = 0;
  private static coordinator = new Coordinator();

  public constructor(type: LiveLoopCatagory) {

    // Get a random loop of the correct catagory
    this.name = LiveLoop.coordinator.getLoopOfType(type);

    // Get a scope number for oscilliscope reading
    this.scopeNum = LiveLoop.coordinator.getFreeScope();

    // Get the ruby for this type of loop
    this.rawRuby = getRubyForLiveLoop(this.name);

    // Get a unique ID for this loop and generate the tag
    this.id = LiveLoop.idCount++;
    this.tag = `loop_${this.id}_${this.name}`;

    this.generateRuby();

    LiveLoop.coordinator.addLoopToSet(this);
  }

  public getTag() { return this.tag; }

  public getScopeNum() { return this.scopeNum; }

  public getRuby() { return this.outputRuby; }

  public getEffectData() { return this.effectData; }

  public getEffectNum() { return this.effectNum; }

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

  public nextEffect() {
    this.effectNum = (this.effectNum + 1) % LiveLoop.numOfEffects;

    // Get the information about the effect
    this.effectData = getEffect(this.effectNum);

    this.generateAndPushRuby();
  }

  public prevEffect() {
    this.effectNum = ((this.effectNum - 1) + LiveLoop.numOfEffects) % LiveLoop.numOfEffects;

    // Get the information about the effect
    this.effectData = getEffect(this.effectNum);

    this.generateAndPushRuby();
  }

  /**
   * Adds the applied effect, volume, and osc data reader wrappers.
   * DOES NOT push the update to the coordinator.
   */
  public generateRuby() {

    let effectParams = this.effectData.name;

    // Add all of the parameters
    for (const entry of Object.entries(this.effectData.parameters)) {
      effectParams = `${effectParams}, ${entry[0]}: ${entry[1]}`;
    }

    this.outputRuby = `
      with_fx "sonic-pi-fx_scope_out", scope_num: ${this.scopeNum} do
        live_loop :${this.tag} do
          with_fx :level, amp: ${this.volume} do
            with_fx :${effectParams} do
              ${this.rawRuby}
            end
          end
        end
      end
    `;
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
  (new LiveLoop('drums')).oscilloscopeData().subscribe(
    number => {
      console.log(number);
    },
  );
}
