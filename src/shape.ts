import LiveLoop from './generation/LiveLoop';
import { LiveLoopName } from './generation/directory';

import * as THREE from 'three';

/**
 * Interface for physical shapes.
 */

export interface Shape {
  // Properties related directly to rendering of shape in three.js
  readonly geometry : THREE.Geometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;

  // Method exposes the mesh to be used by the World
  getMesh() : THREE.Mesh;
}

export class ArbitraryShape implements Shape {
    // Properties related directly to rendering of shape in three.js
  readonly geometry : THREE.Geometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;

  constructor(geo : THREE.Geometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Sphere implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.SphereGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.SphereGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Box implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.BoxGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.BoxGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Tetrahedron implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.TetrahedronGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.TetrahedronGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Torus implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.TorusGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.TorusGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Icosahedron implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.IcosahedronGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.IcosahedronGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Octahedron implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.OctahedronGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.OctahedronGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Dodecahedron implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.DodecahedronGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.DodecahedronGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

export class Cylinder implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.CylinderGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;
  amplitude : number = 0.5;

  constructor(geo : THREE.CylinderGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}

/**
 * Classes for live loop and effect shapes.
 */

/**
 * To create a live loop in the world, create an instance of the LiveLoopShape class.
 * To delete a live loop in the world, call .stop().
 * This creation and deletion are wrapped up in start and stop methods in ./world.
 */
export class LiveLoopShape {

  // Each live loop shape has a name, shape, and live loop.
  readonly liveloop : LiveLoop;
  constructor(public name : LiveLoopName, public shape : Shape) {
    this.liveloop = new LiveLoop(name);
  }

  stop() {
    this.liveloop.delete();
  }

}
