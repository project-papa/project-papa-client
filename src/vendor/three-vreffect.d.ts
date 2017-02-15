import * as THREE from 'three';

export class VREffect {
  constructor(renderer: THREE.Renderer, callback?: (params: string) => void);
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  setSize(width: number, height: number): void;
  requestPresent(): Promise<void>;
  exitPresent(): Promise<void>;
  requestAnimationFrame(callback: FrameRequestCallback): void;
  FovToNDCScaleOffset(fov: VRFov): VREffectOffset;
  FovPortToProjection(fov: VRFov, rightHanded: boolean, zNear: number, zFar: number): THREE.Matrix4;
  FovToProjection(fov: VRFov, rightHanded: boolean, zNear: number, zFar: number): THREE.Matrix4;
  setVRDisplay(display: VRDisplay): void;
  isPresenting: boolean;
}

export interface VRFov {
  leftTan: number;
  rightTan: number;
  upTan: number;
  downTan: number;
}

export interface VREffectOffset {
  scale: number;
  offset: number;
}
