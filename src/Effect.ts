import LiveLoop from 'src/LiveLoop';

export default class Effect {

  private name: string;
  private parameters: { [name : string] : number};
  private outputRuby: string;
  private parentLoop: LiveLoop;

  public constructor(name: string,
                     parameters: { [name : string] : number},
                     parentLoop: LiveLoop) {
    this.name = name;
    this.parameters = parameters;
    this.parentLoop = parentLoop;
    this.generateRuby();
  }

  public getName() { return this.name; }

  public getRuby() { return this.outputRuby; }

  /*
   * Sets a given parameter of this effect to a given value, the pushes the
   * update to the coordinator.
   */
  public setParamater(name: string, value: number) {

    if (!this.parameters.hasOwnProperty(name)) {
      throw new Error('Parameter with name '+name+' has not been defined.');
    }

    // TODO: add sanity checking that the value is within bounds

    this.parameters[name] = value;
    this.generateAndPushRuby();

  }


  /*
   * Generates the initialisation string of an effect, which can be placed at
   * the start of a live loop. Applies each paramater. It does not include the
   * 'end' keyword which must be ysed in the wrapping. DOES NOT push the update
   * to the coordinator.
   */
  private generateRuby() {

    this.outputRuby = 'with_fx :' + this.name;

    for (const parameter in this.parameters) {
      if (this.parameters.hasOwnProperty(parameter)) {
        this.outputRuby =
          this.outputRuby+', '+parameter+': '+this.parameters[parameter];
      }
    }

    this.outputRuby = this.outputRuby + ' do';

  }

  /*
   * Similar to generateRuby, but pushes this update to the coordinator.
   */
  private generateAndPushRuby() {
    this.generateRuby();
    this.parentLoop.generateAndPushRuby();
  }

}
