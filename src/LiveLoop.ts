import Effect from './Effect';
import Coordinator from './Coordinator';


export default class LiveLoop {

  private readonly rawRuby: string;
  private readonly name: string;
  private volume: number;
  private outputRuby: string;
  private parentCoord: Coordinator;

  // Variable to assign a unique ID to each internal effect
  private effectsIdCount: number;

  /*
   * Store a list of effects applied to the live loop.
   * Note that there is a notion of hierarchy - effects at the beginning
   * of the list will be applied first, with those that follow being applied
   * in succession. Also store a map of ID ints to the effects stored, for
   * easy lookup.
   */
  private effectsHeirarchy: Array<Effect>;
  private activeEffects: { [id: number] : Effect };

  public constructor(name: string,
                    rawRuby: string,
                    id: number,
                    parentCoord: Coordinator) {

    // Initialise the internal store of the effects
    this.effectsHeirarchy = [];
    this.activeEffects = {};

    // Convert the ruby into the form of a loop
    this.rawRuby = 'live_loop :Loop_'+id+'_'+name+' do\n'+rawRuby+'\ndo';
    this.parentCoord = parentCoord;

    this.generateRuby();
  }

  public getName() { return this.name; }

  public getActiveEffects() { return this.activeEffects; }

  public getRuby() { return this.outputRuby; }

  public getEffect(effectId: number) {
    if (!this.activeEffects.hasOwnProperty(effectId)) {
      throw new Error('Effect ID ' + effectId + ' not present');
    }
    return this.activeEffects[effectId];
  }

  /*
   * Takes an argument that is the name of a defined effect, and creates a new
   * effect object. New effects are applied to the live loop last. Then Pushes
   * the update to the coordinator, and return the ID.
   */
  public addEffect(effectName: string) {

    if (!this.parentCoord.getEffectsDirectory().hasOwnProperty(effectName)) {
      throw new Error('Effect with name '+effectName+' has not been defined.');
    }

    // Get a unique ID for this loop
    const effectId = this.effectsIdCount;
    this.effectsIdCount += 1;

    // Create the new effect
    const e = new Effect(effectName,
                         this.parentCoord.getEffectsDirectory()[effectName],
                         this);

    // Add it to the internal store
    this.effectsHeirarchy[effectId] = e;
    this.effectsHeirarchy.push(e);

    this.generateAndPushRuby();

    return effectId;

  }

  /*
   * Removes an effect with a specified ID (unique this this liveloop). Then
   * pushes this update to the coordinator.
   */
  public removeEffect(effectId: number) {

    if (!this.activeEffects.hasOwnProperty(effectId)) {
      throw new Error('Effect not present storage list.');
    }

    // Get the index of the specified effect
    const index = this.effectsHeirarchy.indexOf(this.activeEffects[effectId]);

    // Test if the effect was present
    if (index < 0) {
      throw new Error('Effect not present in hierarchy.');
    }

    // Remove the specified effect from both storage sections
    this.effectsHeirarchy.splice(index, 1);
    delete this.activeEffects[effectId];

    this.generateAndPushRuby();
  }

  /*
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

  }

  /*
   * Similar to generateRuby, but pushes this update to the coordinator.
   */
  public generateAndPushRuby() {
    this.generateRuby();
    this.parentCoord.generateRuby();
  }

}
