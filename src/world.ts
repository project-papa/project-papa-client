import * as THREE from 'three';
import { Shape } from 'src/shape';
import VrEnvironment from './VrEnvironment';
import window from 'src/window';

export class World {

  /**
   * Each World will have a scene, camera, and renderer
   * (set up at construction time):
   * NOTE: These are private members.
   */
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private vrEnvironment: VrEnvironment;

  /**
   * Each World will also keep track of what shapes are currently in it,
   * what live loop shapes are in it, and what effects each live loop has:
   * NOTE: These are private members.
   */
  private shapes : Array<Shape> = [];
  // Mapping for liveloops is ID (number) to name (string)
  private liveloops : { [index: number] : string } = {};
  // Mapping for effects is ID of liveloop (number) to IDs (numbers)
  private effects : { [index: number] : Array<number> } = {};

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

    // Set up VR environment:
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.vrEnvironment = new VrEnvironment(this.renderer, this.camera, this.scene);
    this.vrEnvironment.init();
    this.vrEnvironment.setSize(window.innerWidth, window.innerHeight);
  }

  // Public methods:

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
   * Add live loop (by name) to the world.
   */
  addLiveLoop(name: string) {
    /**
     * TODO: Call addLiveloop function (from Rowan's code) to get liveloop ID
     * and to update music.
     * Note: Currently using placeholder of 1 for ID.
     */
    // Add to liveloops:
    this.liveloops[1] = name;
    // Add to effects (initialize to 0 effects):
    this.effects[1] = [];
  }

  /**
   * Remove live loop (by ID) from the world.
   */
  removeLiveLoop(id: number) {
    // Remove from liveloops:
    delete this.liveloops[id];
    // Remove from effects:
    delete this.effects[id];
    // TODO: Call removeLiveloop function (from Rowan's code) to update music.
  }

  /**
   * Add effect (by name) to a particular live loop (by ID).
   */
  addEffect(liveloopId: number, name: string) {
    /**
     * TODO: Call addEffect function (from Rowan's code) to get effect ID
     * and to update music.
     * Note: Currently using placeholder of 1 for ID.
     */
    // Add to effects:
    this.effects[liveloopId].push(1);
  }

  /**
   * Remove effect (by ID) from a particular live loop (by ID).
   */
  removeEffect(liveloopId: number, effectId: number) {
    // Remove from effects:
    const index = this.effects[liveloopId].indexOf(effectId);
    this.effects[liveloopId].splice(index, 1);
    // TODO: Call removeEffect function (from Rowan's code) to update music.
  }

  /**
   * Update the objects in the world
   */
  update(delta: number) {
    // Do something
  }

  /**
   * Start rendering and updating the world
   */
  start() {
    window.document.body.appendChild(this.renderer.domElement);

    this.vrEnvironment
      .createAnimator(delta => this.update(delta))
      .start();
  }
}
