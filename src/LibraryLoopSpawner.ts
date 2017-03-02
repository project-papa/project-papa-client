import * as THREE from 'three';
import { Shape, ArbitraryShape, Cylinder, Box, Dodecahedron, Icosahedron, Tetrahedron, Octahedron, LiveLoopShape, EffectShape } from 'src/shape';
import { LiveLoopName, EffectName } from './generation/directory';

/**
 *  Class that manages the generation and display of shapes that
 *  represent the library of live loops.
 *
 *  These reside in the library tray and are not explicity
 *  'Live loop shapes'
 */
export class LibraryLoopSpawner {
  // Store an array of shapes that will exist in the library
  shapelibrary : Array<Shape> = [];

  // Scene which shapes will exist in
  private scene : THREE.Scene;

  /**
   * Method to generate each of the loop shapes
   * These will be hard coded shapes here
   */
  private generateLibraryShapes() {
    const box = new Box(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshPhongMaterial({ color: 0x00ffff, specular: 0x69bccc, shininess: 10, shading: THREE.FlatShading, opacity: 0.8, transparent: true }),
    );
    box.getMesh().position.set(0, -0.7, -1.5);
    box.getMesh().userData = { isLibraryLoop: true, id: this.shapelibrary.length, isProjected: false };
    this.shapelibrary.push(box);

    const tetrahedron = new Tetrahedron(
      new THREE.TetrahedronGeometry(0.5),
      new THREE.MeshPhongMaterial({ color: 0xff6600, specular: 0x69bccc, shininess: 10, shading: THREE.FlatShading, opacity: 0.8, transparent: true }),
    );
    tetrahedron.getMesh().userData = { isLibraryLoop: true, id: this.shapelibrary.length, isProjected: false };
    tetrahedron.getMesh().position.set(1.5, -0.7, 0);
    this.shapelibrary.push(tetrahedron);

    const octahedron = new Octahedron(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshPhongMaterial({ color: 0xffff00, specular: 0x69bccc, shininess: 10, shading: THREE.FlatShading, opacity: 0.8, transparent: true }),
    );
    octahedron.getMesh().userData = { isLibraryLoop: true, id: this.shapelibrary.length, isProjected: false };
    octahedron.getMesh().position.set(-1.5, -0.5, 0);
    this.shapelibrary.push(octahedron);

    const icos = new Icosahedron(
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.MeshPhongMaterial({ color: 0xff00ff, specular: 0x69bccc, shininess: 10, shading: THREE.FlatShading, opacity: 0.8, transparent: true }),
    );
    icos.getMesh().userData = { isLibraryLoop: true, id: this.shapelibrary.length, isProjected: false };
    icos.getMesh().position.set(1.4, -1, -1.4);
    this.shapelibrary.push(icos);

    const dodecahedron = new Dodecahedron(
      new THREE.DodecahedronGeometry(0.4, 0),
      new THREE.MeshPhongMaterial({ color: 0x66ff33, specular: 0x69bccc, shininess: 10, shading: THREE.FlatShading, opacity: 0.8, transparent: true }),
    );
    dodecahedron.getMesh().userData = { isLibraryLoop: true, id: this.shapelibrary.length, isProjected: false };
    dodecahedron.getMesh().position.set(-1.2, -0.7, -1.2);
    this.shapelibrary.push(dodecahedron);
  }

  constructor(scene : THREE.Scene) {
    this.generateLibraryShapes();
    this.scene = scene;
    this.addLibraryShapes();
  }

  // Public methods

  /**
   * Generates a new LiveLoopShape from an existing
   * shape in the library
   */
  spawnNewLiveLoopShape(s : Shape) {
    // Generate a new shape from which to spawn
    const newShape = new ArbitraryShape(
      (s.mesh.clone(true).geometry as THREE.Geometry),
      s.mesh.clone(true).material,
    );

    // Update the shape's meshes user data
    newShape.mesh.userData = { isLiveLoop: true, id: undefined };

    return new LiveLoopShape(
      'ambient_piano', /* Hardcoded for now... */
      newShape,
    );
  }

  /**
   * Add all of the shapes from the library to the scene
   */
  addLibraryShapes() {
    for (const shape of this.shapelibrary) {
      this.scene.add(shape.mesh);
    }
  }
}
