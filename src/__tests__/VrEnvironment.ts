jest.mock('three');

import * as td from 'testdouble';
import * as THREE from 'three';
import { VREffect } from 'src/vendor/three-vreffect';
import { VRControls } from 'src/vendor/three-vrcontrols';
import VrEnvironment from '../VrEnvironment';

function createMockEnvironment(excludedMethods: string[] = []) {
  const renderer: any = td.object([]);
  const camera: any = td.object([]);
  const scene: any = td.object([]);
  const effect: any = td.object(['requestAnimationFrame', 'render']);
  const controls: any = td.object(['update']);
  const window: any = td.object([]);

  return {
    renderer,
    camera,
    scene,
    effect,
    controls,
    window,
    environment: new VrEnvironment(
      renderer,
      camera,
      scene,
      effect,
      controls,
      window,
    ),
  };
}

it('should initialise when init is called', () => {
  const { environment } = createMockEnvironment();
  td.replace(environment, 'initScreens');

  environment.init();

  td.verify((environment as any).initScreens());
});

it('should use screens when they exist', async () => {
  const { environment, window } = createMockEnvironment();

  const display = {
    capabilities: { canPresent: true },
  };

  window.navigator = {
    getVRDisplays: async () => [display],
  };

  td.replace(environment, 'setDisplay');

  await (environment as any).initScreens();

  td.verify((environment as any).setDisplay(display));
});

it('should call the correct methods in the animator', () => {
  const { environment, effect, controls, scene, camera } = createMockEnvironment();

  const renderFn: any = td.function('render');

  environment.createAnimator(renderFn).start();

  td.verify(effect.requestAnimationFrame(td.matchers.isA(Function)));
  td.verify(effect.render(scene, camera));
  td.verify(controls.update());
  td.verify(renderFn(td.matchers.isA(Number)));
});
