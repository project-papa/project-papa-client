import * as THREE from 'three';

import { Colours } from 'src/colours';
import { Cylinder, Shape } from 'src/shape';
import SelectListener from 'src/SelectListener';
import { Entity } from 'src/entities/entity';
import LiveLoopTemplate, { templateDefinitions } from 'src/entities/LiveLoopTemplate';
import LiveLoopEntity, { LiveLoopEntityDefinition } from 'src/entities/LiveLoopEntity';
import { LiveLoopCatagory } from './generation/directory';
import createReticle from './reticle';

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
  private entities: Set<Entity> = new Set();

  /**
   * Each World will also keep track of what shapes are currently in it.
   * NOTE: This is a  private member.
   */
  private shapes: Array<Shape> = [];

  /**
   * Lights associated with the world.
   * NOTE: We simply use three's implementations of lights as
   * we need not carry around any additional information (yet).
   */
  private lights: Array<THREE.Light> = [];

  readonly selectListener: SelectListener;

  constructor() {
    // Basic set up of scene, camera, and renderer:
    this.scene = new THREE.Scene();

    // NOTE: arguments to perspective camera are:
    // Field of view, aspect ratio, near and far clipping plane
    this.camera = new THREE.PerspectiveCamera(
      75,
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

    // Set up the Selector by passing it the scene and camera
    this.selectListener = new SelectListener(this.camera, this.scene);
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
    entity.onRemove(this);
  }

  hasEntity(entity: Entity) {
    return this.entities.has(entity);
  }

  /**
   * Add shape to world:
   */
  addShape(shape: Shape) {
    // First add to scene:
    this.scene.add(shape.mesh);
    // Then add to shapes array:
    this.shapes.push(shape);
  }

  /**
   * Set up the physical environment itself.
  */
  setupEnvironment() {
    // Set a background colour:
    this.scene.background = new THREE.Color(0x0d0d0d);

    // Add a wireframe grid helper to the scene:
    // (for debug purposes)
    const gridHelper = new THREE.GridHelper(150, 150);
    gridHelper.position.set(0, -2, 0);
    this.scene.add(gridHelper);

    // Add ambient light:
    const ambientLight = new THREE.AmbientLight(0x808080);
    this.lights.push(ambientLight);
    this.scene.add(ambientLight);

    // Add a point light:
    const pLight = new THREE.PointLight(0xffffff, 7, 10, 2);
    pLight.position.set(0, 5, 0);
    this.lights.push(pLight);
    this.scene.add(pLight);

    // Place the cylinder floor in the world:
    // (This is a placeholder for the tray that will hold the live loops.)
    const cylinder = new Cylinder(
      new THREE.CylinderGeometry(10, 10, 0.5, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.2, transparent: true }),
    );
    cylinder.getMesh().position.set(0, -5, 0);
    // Add the shape and mesh to their respective arrays:
    this.shapes.push(cylinder);
    this.scene.add(cylinder.getMesh());

    this.addEntity(new LiveLoopTemplate(templateDefinitions.ambient));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.lead));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.bass));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.drums));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.weird));
  }

  /**
   * Update the objects in the world
   */
  update(delta: number) {
    this.selectListener.update();
    for (const entity of this.entities) {
      if (entity.onUpdate) {
        entity.onUpdate(delta);
      }
    }
  }

  /**
   * Start rendering and updating the world
   */
  start() {
    window.document.body.appendChild(this.renderer.domElement);

    // Set up the environement itself (i.e. populate with shapes)
    this.setupEnvironment();

    this.vrEnvironment
      .createAnimator(delta => this.update(delta))
      .start();
  }
}
