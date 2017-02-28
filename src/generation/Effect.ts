import LiveLoop from './LiveLoop';
import { getParametersForEffect, EffectName } from './directory';

export default class Effect {

  private name: string;
  private parameters: Map<string, number>;
  private outputRuby: string;
  private parentLoop: LiveLoop;

  // Directory of effect names to their adjustable settings
  private static effectsDirectory: { [name: string] : { [parameter : string] : number} };

  public constructor(name: EffectName, parentLoop: LiveLoop) {

    if (!Effect.effectsDirectory.hasOwnProperty(name)) {
      throw new Error('Effect with name '+name+' has not been defined.');
    }

    this.name = name;
    this.parameters = getParametersForEffect(name);
    this.parentLoop = parentLoop;
    this.generateRuby();

    this.parentLoop.addEffectToSet(this);

  }

  public getName() { return this.name; }

  public getRuby() { return this.outputRuby; }

  /*
   * Sets a given parameter of this effect to a given value, the pushes the
   * update to the coordinator.
   */
  public setParamater(name: string, value: number) {

    if (!this.parameters.has(name)) {
      throw new Error('Parameter with name '+name+' has not been defined.');
    }

    this.parameters.set(name, value);
    this.generateAndPushRuby();

  }

  /**
   * Generates the initialisation string of an effect, which can be placed at
   * the start of a live loop. Applies each paramater. It does not include the
   * 'end' keyword which must be ysed in the wrapping. DOES NOT push the update
   * to the coordinator.
   */
  private generateRuby() {

    this.outputRuby = 'with_fx :' + this.name;

    for (const parameter of this.parameters.entries()) {
      this.outputRuby = this.outputRuby+', '+parameter[0]+': '+parameter[1];
    }

    this.outputRuby = this.outputRuby + ' do';

  }

  /**
   * Similar to generateRuby, but pushes this update to the coordinator.
   */
  private generateAndPushRuby() {
    this.generateRuby();
    this.parentLoop.generateAndPushRuby();
  }

  /**
   * Method for deleting this Effect from the Loop it belongs to. Once an
   * Effect has been deleted, it should not be readded, and should instead
   * be left for garbage collection.
   */
  public delete() {
    this.parentLoop.removeEffectFromSet(this);
  }

}
