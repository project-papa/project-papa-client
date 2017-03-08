import * as THREE from 'three';

import { Colours } from 'src/colours';
import SelectListener from 'src/SelectListener';
import { Entity } from 'src/entities/entity';
import LiveLoopTemplate, { templateDefinitions } from 'src/entities/LiveLoopTemplate';
import LiveLoopEntity, { LiveLoopEntityDefinition } from 'src/entities/LiveLoopEntity';
import GridEntity from 'src/entities/GridEntity';
import TemplateBase from 'src/entities/TemplateBase';
import { LiveLoopCatagory } from './generation/directory';
import SubscriptionsSet from './SubscriptionsSet';
import createReticle from './reticle';
import LiveLoop from 'src/generation/LiveLoop';
import { createBrandElement } from './brand';
import { SmoothValue, ExponentialAverage } from './SmoothValue';
import Grabber, { Grabbable } from 'src/Grabber';

import VrEnvironment from './VrEnvironment';
import window from 'src/window';

export class World {

  /**
   * Each World will have a scene, camera, and renderer
   * (set up at construction time):
   * NOTE: These are private members.
   */
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private vrEnvironment: VrEnvironment;
  private subscriptionsSet: SubscriptionsSet;
  private entities = new Set<Entity>();
  private prevTimestamp: number = 0;
  private amplitude: SmoothValue;
  readonly grabber: Grabber;
  private ambientLight: THREE.Light;

  readonly selectListener: SelectListener;

  constructor() {
    // Basic set up of scene, camera, and renderer:
    this.scene = new THREE.Scene();

    // NOTE: arguments to perspective camera are:
    // Field of view, aspect ratio, near and far clipping plane
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1, 1000,
    );
    this.camera.add(createReticle());
    this.scene.add(this.camera);

    // Set up VR environment:
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.vrEnvironment = new VrEnvironment(this.renderer, this.camera, this.scene);
    this.vrEnvironment.init();
    this.vrEnvironment.setSize(window.innerWidth, window.innerHeight);

    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.right = '0';
    this.renderer.domElement.style.bottom = '0';
    this.renderer.domElement.style.top = '0';

    // Setup renderer for casting of shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.vrEnvironment.setSize(window.innerWidth, window.innerHeight);
    });

    // Set up the Selector by passing it the scene and camera
    this.selectListener = new SelectListener(this.camera, this.scene);
    this.subscriptionsSet = new SubscriptionsSet(this.scene, this.selectListener.selector);
    this.amplitude = new ExponentialAverage(0.5, 0);
    this.grabber = new Grabber(this.selectListener, this.camera);
  }

  // Public methods:

  /**
   * Add an entity to the world
   *
   * entity.onAdd will be called when the entity _is_ in the entity set
   */
  addEntity(entity: Entity) {
    if (this.hasEntity(entity)) {
      throw new Error('Cannot add an entity to a world twice');
    }

    this.entities.add(entity);
    entity.onAdd(this);
  }

  /**
   * Remove an entity from the world
   *
   * entity.onRemove will be called when the entity is _not_ in the entity set
   */
  removeEntity(entity: Entity) {
    if (!this.hasEntity(entity)) {
      throw new Error('Cannot remove an entity that is not in the world');
    }

    this.entities.delete(entity);
    if (entity.onRemove) {
      entity.onRemove(this);
    }
    this.subscriptionsSet.releaseEntitySubscriptions(entity);
  }

  hasEntity(entity: Entity) {
    return this.entities.has(entity);
  }

  /**
   * Adds a threejs object to the world that will be removed when this entity is
   */
  addObjectForEntity: SubscriptionsSet['addObjectForEntity'] = (entity, object) => {
    this.subscriptionsSet.addObjectForEntity(entity, object);
  }

  /**
   * Gets an observable that will emit one element when the entity is removed
   */
  getEntityLifetime: SubscriptionsSet['getEntityLifetime'] = entity => {
    return this.subscriptionsSet.getEntityLifetime(entity);
  }

  /**
   * Adds an object to be checked for selections that will stop checking when the entity is removed
   */
  addSelectorObject: SubscriptionsSet['addSelectorObject'] = (entity, object) => {
    this.subscriptionsSet.addSelectorObject(entity, object);
  }

  /**
   * Set up the physical environment itself.
  */
  setupEnvironment() {
    // Set a background colour:
    this.scene.background = new THREE.Color(0x0d0d0d);
    this.scene.fog = new THREE.FogExp2(0x0d0d0d, 0.035);

    // Add a wireframe grid helper to the scene:
    this.addEntity(new GridEntity());

    // Add ambient light:
    const ambientLight = new THREE.AmbientLight(0x808080);
    this.ambientLight = ambientLight;
    this.scene.add(ambientLight);

    // Place the cylinder floor in the world:
    const base = new TemplateBase();
    this.addEntity(base);

    this.addEntity(new LiveLoopTemplate(templateDefinitions.ambient));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.lead));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.bass));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.drums));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.weird));

    // Add a directional light above the base:
    const light = new THREE.SpotLight(0x808080, 0.2);
    light.castShadow = true;
    light.shadowCameraFov = this.camera.fov;
    light.shadowBias = 0.0001;
    light.shadowMapHeight = 1024;
    light.shadowMapHeight = 1024;
    light.position.set(0, 50, 0);
    light.target = base.mesh!;
    this.scene.add(light);

    const middleLight = new THREE.PointLight(0xaaaaaa, 2, 10);
    middleLight.position.y = 3;
    this.scene.add(middleLight);
  }

  /**
   * Update the objects in the world
   */
  update(timestamp: number) {
    const delta = timestamp - this.prevTimestamp;
    this.prevTimestamp = timestamp;
    this.selectListener.update();
    this.grabber.update();
    for (const entity of this.entities) {
      if (entity.onUpdate) {
        entity.onUpdate(delta);
      }
    }

    let sum = 0;
    for (const entity of this.entities) {
      if ((<LiveLoopEntity>entity).amplitude) {
        sum += (<LiveLoopEntity>entity).amplitude.getTarget();
      }
    }
    this.amplitude.setTarget(sum);
    this.amplitude.update(delta);
    const red = Math.max(Math.min(Math.min(this.amplitude.getValue()) ** 2, 1) / 2, 0) * 0xff;
    this.scene.background = new THREE.Color((red << 16) + 0x101040);
    this.scene.fog.color = this.scene.background;
    this.ambientLight.color = this.scene.fog.color;
  }

  /**
   * Start rendering and updating the world
   */
  start() {
    window.document.body.appendChild(this.renderer.domElement);
    window.document.body.appendChild(createBrandElement());

    // Set up the environement itself (i.e. populate with shapes)
    this.setupEnvironment();

    this.vrEnvironment
      .createAnimator(delta => this.update(delta))
      .start();
  }
}
