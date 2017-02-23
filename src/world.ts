import * as THREE from 'three';

import { Shape, Cylinder, Box } from 'src/shape';
import { Colours } from 'src/colours';
import { Selector } from 'src/selector';

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

  /**
   * Lights associated with the world.
   * NOTE: We simply use three's implementations of lights as
   * we need not carry around any additional information (yet).
   */
  private lights : Array<THREE.Light> = [];

  private shapeSelector : Selector;

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

    // Set up the Selector by passing it the scene and camera
    this.shapeSelector = new Selector(
      this.camera,
      this.scene,
      (mesh : THREE.Mesh) => { /* On mesh selection */
        // TEMPORARY - For demonstration purposes
        if ((mesh as THREE.Mesh).geometry instanceof THREE.BoxGeometry) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(Colours.getBoxSelected());
        }
      }, (mesh : THREE.Mesh) => { /* On mesh deselection */
        // TEMPORARY - For demonstration purposes
        if ((mesh as THREE.Mesh).geometry instanceof THREE.BoxGeometry) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(Colours.getBoxDefault());
        }
      }, () => { /* On mesh having been projected into the world */
        const selectedMesh = this.shapeSelector.getSelectedMesh();
        if (selectedMesh) {
          if (!selectedMesh.userData.isProjected) {
            const selectedShape = this.shapes[selectedMesh.userData.id];
            selectedMesh.userData.isProjected = true;

            console.log("we are projected!");
            // TODO: Play a liveloop here...
            // ...
            // ...
          }
        }
      }
    );
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
   * Set up the physical environment itself.
  */
  setupEnvironment() {
    // Set a background colour:
    this.scene.background = new THREE.Color(0xff9dc6);

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
      new THREE.CylinderGeometry(8, 8, 0.5, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xfff8b6, specular: 0xfffce3, shininess: 1 }),
    );

    cylinder.getMesh().position.set(0, -2, 0);

    // Add the shape and mesh to their respective arrays:
    this.shapes.push(cylinder);
    this.scene.add(cylinder.getMesh());

    // TEMPORARY
    // Add a box here...
    const box = new Box(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x65a6b2, specular: 0x69bccc, shininess: 10 }),
    );
    box.getMesh().position.set(1, 0, -1);
    // Include some user data to work out shape from mesh
    box.getMesh().userData = { id: this.shapes.length, isProjected: false };
    this.shapes.push(box);
    this.scene.add(box.getMesh());

    const box2 = new Box(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x65a6b2, specular: 0x69bccc, shininess: 10 }),
    );
    box2.getMesh().position.set(-1, 0, -1);
    // Include some user data to work out shape from mesh
    box2.getMesh().userData = { id: this.shapes.length, isProjected: false };
    this.shapes.push(box2);
    this.scene.add(box2.getMesh());
  }

  /**
   * Update the objects in the world
   */
  update(delta: number) {
    // TODO: Do something more maintainable about these function calls
    this.shapeSelector.updateSelectedMesh();
    this.shapeSelector.projectMesh();
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
