import * as THREE from 'three';

export class Colours {
  private static  boxDefault = new THREE.Color(0x69bccc);
  private static boxSelected = new THREE.Color(0x90edff);

  static getBoxDefault() { return Colours.boxDefault; }
  static getBoxSelected() { return Colours.boxSelected; }
}