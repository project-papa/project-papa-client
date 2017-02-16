import * as THREE from 'three';

export interface Shape {
  // Properties related directly to rendering of shape in three.js
  readonly geometry : THREE.Geometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;

  // Method exposes the mesh to be used by the World
  getMesh() : THREE.Mesh;
}

export class Sphere implements Shape {
  // Properties related directly to rendering of shape in three.js
  /* Note: Properties are immutable for now, as unsure how the renderer
     handles change to a Mesh once rendering has begun */
  readonly geometry : THREE.SphereGeometry;
  readonly material : THREE.Material;
  readonly mesh : THREE.Mesh;

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

  constructor(geo : THREE.BoxGeometry, mat : THREE.Material) {
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

  constructor(geo : THREE.CylinderGeometry, mat : THREE.Material) {
    this.geometry = geo;
    this.material = mat;

    // Instantiate the mesh from the geometry and the material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() { return this.mesh; }
}
