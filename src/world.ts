import * as THREE from 'three';

import { Colours } from 'src/colours';
import { Shape, Cylinder, Box, LiveLoopShape, EffectShape } from 'src/shape';
import { Selector } from 'src/selector';
import { LiveLoopName, EffectName } from './generation/directory';
import createReticle from './reticle';
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
   * Each World will also keep track of what shapes are currently in it.
   * NOTE: This is a  private member.
   */
  private shapes : Array<Shape> = [];

  /**
   * Lights associated with the world.
   * NOTE: We simply use three's implementations of lights as
   * we need not carry around any additional information (yet).
   */
  private lights : Array<THREE.Light> = [];

  private shapeSelector : Selector;

  /**
   * Crosshair that helps user select shapes in the world
   */
  private crosshair : THREE.Mesh;

  constructor() {
    // Basic set up of scene, camera, and renderer:
    this.scene = new THREE.Scene();

    // Add the crosshair here
    this.crosshair = new THREE.Mesh(
      new THREE.RingGeometry( 0.02, 0.04, 32 ),
      new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
      }),
		);
    this.crosshair.position.z = -2;
    this.scene.add(this.crosshair);

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
    this.shapeSelector = new Selector(
      this.camera,
      this.scene,
      this.crosshair,
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

            console.log('we are projected!');
            const dnbShape = this.startLiveLoop('dnb', selectedShape);
            setTimeout(() => {
              this.stopLiveLoop(dnbShape);
            }, 5000);
          }
        }
      },
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
   * Start live loop (by name and shape) to the world as a LiveLoopShape.
   */
  startLiveLoop(name: LiveLoopName, shape: Shape) {
    return new LiveLoopShape(name, shape);
  }

  /**
   * Stop live loop (by LiveLoopShape) from the world.
   */
  stopLiveLoop(liveLoopShape: LiveLoopShape) {
    liveLoopShape.stop();
  }

  /**
   * Add effect (by name and shape) to a particular live loop (by LiveLoopShape).
   */
  addEffect(name: EffectName, shape: Shape, liveLoopShape : LiveLoopShape) {
    const effect = new EffectShape(name, shape, liveLoopShape);
  }

  /**
   * Remove effect (by EffectShape) from a particular live loop.
   */
  removeEffect(effectShape : EffectShape) {
    effectShape.remove();
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
