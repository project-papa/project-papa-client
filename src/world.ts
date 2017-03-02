import * as THREE from 'three';

import { Colours } from 'src/colours';
import { Shape, Sphere, Torus, Icosahedron, Cylinder, Box, Tetrahedron, Octahedron, Dodecahedron, LiveLoopShape } from 'src/shape';
import SelectListener from 'src/SelectListener';
import { Entity } from 'src/entities/entity';
import LiveLoopTemplate, { templateDefinitions } from 'src/entities/LiveLoopTemplate';
import LiveLoopEntity, { LiveLoopEntityDefinition } from 'src/entities/LiveLoopEntity';
import { LiveLoopName, EffectName } from './generation/directory';
import createReticle from './reticle';
import { LibraryLoopSpawner } from 'src/libraryloopspawner';

import VrEnvironment from './VrEnvironment';
import window from 'src/window';

export class World {

  /**
   * Each World will have a scene, camera, and renderer
   * (set up at construction time):
   * NOTE: These are private members.
   */
  readonly scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private vrEnvironment: VrEnvironment;
  private entities: Set<Entity> = new Set();

  /**
   * Each World will also keep track of what shapes are currently in it.
   * NOTE: This is a  private member.
   */
  private shapes: Array<Shape> = [];

  /**
   * A separate array of live loop shapes is also maintained
   * This allows them to be selected based on gesture
   */
  private liveloopShapes : Array<LiveLoopShape> = [];

  /**
   * Lights associated with the world.
   * NOTE: We simply use three's implementations of lights as
   * we need not carry around any additional information (yet).
   */
  private lights: Array<THREE.Light> = [];

  readonly selectListener: SelectListener;

  /**
   * Crosshair that helps user select shapes in the world
   */
  private crosshair : THREE.Mesh;

  /**
   * Spawner that managers Library of shapes that will
   * represent live loops in tray
   */
  private librarySpawner : LibraryLoopSpawner;

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
        side: THREE.DoubleSide,
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

    // Set up the spawner for the shapes
    this.librarySpawner = new LibraryLoopSpawner(this.scene);

    // Set up the Selector by passing it the scene and camera
    this.shapeSelector = new Selector(
      this.camera,
      this.scene,
      this.crosshair,
      (mesh : THREE.Mesh) => { /* On mesh selection */
        // Colour the mesh appropriately
        if (mesh.userData.isLiveLoop || mesh.userData.isLibraryLoop) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(Colours.getBoxSelected());
        }
      }, (mesh : THREE.Mesh) => { /* On mesh deselection */
        if (mesh.userData.isLiveLoop || mesh.userData.isLibraryLoop) {
          (mesh.material as THREE.MeshPhongMaterial).color.set(Colours.getBoxDefault());
        }
      }, (mesh : THREE.Mesh) => { /* On fist start */
        // Check the selected mesh has associated live loop
        if (mesh.userData.isLiveLoop) {
          this.shapeSelector.startMeshMove(mesh);
        } else if (mesh.userData.isLibraryLoop) {
          // Get the shape from the mesh
          const selectedShape = this.librarySpawner.shapelibrary[mesh.userData.id];

          console.log(selectedShape);
          // Spawn a new live loop
          const newLiveLoop = this.librarySpawner.spawnNewLiveLoopShape(selectedShape);
          newLiveLoop.shape.mesh.userData.id = this.liveloopShapes.length;

          this.liveloopShapes.push(newLiveLoop);
          this.scene.add(newLiveLoop.shape.mesh);
          this.shapeSelector.startMeshMove(newLiveLoop.shape.mesh);
        }
      }, (mesh : THREE.Mesh) => { /* On fist end */
        if (mesh.userData.isLiveLoop) {
          this.shapeSelector.endMeshMove(mesh);
        }
      }, (mesh : THREE.Mesh) => { /* On wave in start */
        console.log('wave in start');
        // TODO: Alter effects...
        // TODO: ...
      }, (mesh : THREE.Mesh) => { /* On wave in end */
        console.log('wave in end');
        // TODO: Alter effects...
        // TODO: ...
      }, (mesh : THREE.Mesh) => { /* On wave out start */
        console.log('wave out start');
        // TODO: Alter effects...
        // TODO: ...
      }, (mesh : THREE.Mesh) => { /* On wave out end */
        console.log('wave out end');
        // TODO: Alter effects...
        // TODO: ...
      }, (mesh : THREE.Mesh) => { /* On spread start */
        console.log('spread start');
        // Maybe this is empty...?
      }, (mesh : THREE.Mesh) => { /* On spread end */
        console.log('spread end');
        if (mesh.userData.isLiveLoop) {
          const selectedShape = this.liveloopShapes[mesh.userData.id];
          // End the liveloop's playing
          selectedShape.stop();

          // Delete the mesh from the world
          // TODO: ...
        }
      },
    );
    
    // Note this was in conflict with above...
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
   * Start live loop (by name and shape) to the world as a LiveLoopShape.
   */
  startLiveLoop(name: LiveLoopName, shape: Shape) {
    const liveLoopShape = new LiveLoopShape(name, shape);
    liveLoopShape.liveloop.oscilloscopeData().subscribe(
      amplitude => {
        // Calculate scaling factor from old and new amplitudes.
        const oldAmp = liveLoopShape.shape.amplitude;
        const factor = amplitude / oldAmp;
        // Apply scaling.
        liveLoopShape.shape.geometry.scale(factor, factor, factor);
        // Update shape's amplitude.
        liveLoopShape.shape.amplitude = amplitude;
      },
    );
  }

  /**
   * Stop live loop (by LiveLoopShape) from the world.
   */
  stopLiveLoop(liveLoopShape: LiveLoopShape) {
    liveLoopShape.stop();
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

    const ambientTemplate = new LiveLoopTemplate(templateDefinitions.ambient);
    this.addEntity(ambientTemplate);
    this.addEntity(new LiveLoopTemplate(templateDefinitions.lead));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.bass));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.percussive));
    this.addEntity(new LiveLoopTemplate(templateDefinitions.weird));
    /**
     * Uncomment for example of adding an entity:
     * const ambientEntityDef: LiveLoopEntityDefinition = {
     * name: 'ambient_piano',
     * mesh: ambientTemplate.mesh,
     * };
     * this.addEntity(new LiveLoopEntity(ambientEntityDef));
     */
  }

  /**
   * Update the objects in the world
   */
  update(delta: number) {
    // This will eventually be removed due to the updated listener
    this.shapeSelector.update(delta);
    
    this.selectListener.update();
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
