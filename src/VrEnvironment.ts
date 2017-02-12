import 'webvr-polyfill';
import { VREffect } from 'src/vendor/three-vreffect';
import { VRControls } from 'src/vendor/three-vrcontrols';
import globalWindow from 'src/window';
import * as THREE from 'three';

export default class VrEnvironment {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private effect: VREffect;
  private controls: VRControls;
  private window: Window;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, scene: THREE.Scene,
              effect = new VREffect(renderer), controls = new VRControls(camera), window = globalWindow) {
    this.scene = scene;
    this.camera = camera;
    this.effect = effect;
    this.controls = controls;
    this.window = window;
  }

  init() {
    this.initScreens();
  }

  private async initScreens() {
    const displays = (await this.window.navigator.getVRDisplays()).filter(display =>
      display.capabilities.canPresent,
    );

    if (displays.length > 0) {
      this.setDisplay(displays[0]);
    }
  }

  private setDisplay(display: VRDisplay) {
    this.effect.setVRDisplay(display);
    this.controls.setVRDisplay(display);

    this.window.addEventListener('keydown', event => {
      if (event.key === 'v') {
        if (this.effect.isPresenting) {
          this.effect.exitPresent();
        } else {
          this.effect.requestPresent();
        }
      }
    });
  }

  setSize(width: number, height: number) {
    this.effect.setSize(width, height);
  }

  createAnimator(render: FrameRequestCallback) {
    const animator: FrameRequestCallback = delta => {
      this.effect.requestAnimationFrame(animator);
      render(delta);
      this.controls.update();
      this.effect.render(this.scene, this.camera);
    };

    return {
      start: () => {
        animator(0);
      },
    };
  }
}
