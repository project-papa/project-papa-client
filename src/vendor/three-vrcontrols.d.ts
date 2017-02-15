import * as THREE from 'three';

export class VRControls {
  constructor(camera: THREE.Camera, callback?: (param: string) => void);

  /**
   * Update VR Instance Tracking
   */
  update(): void;
  zeroSensor(): void;
  scale: number;
  setVRDisplay(display: VRDisplay): void;
}
