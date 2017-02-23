import Effect from './Effect';
import LiveLoop from './LiveLoop';

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
  constructor(public name : string, public shape : Shape) {
    /**
     * Update and uncomment the following once we have updated version of LiveLoop class.
     * this.liveloop = new LiveLoop(name);
     */
  }

  stop() {
    /**
     * Update and uncomment the following once we have updated version of LiveLoop class.
     * this.liveloop.delete();
     */
  }

}

/**
 * To create an effect in the world, create an instance of the EffectShape class.
 * To delete an effect in the world, call .remove().
 * This creation and deletion are wrapped up in add and remove methods in ./world.
 */
export class EffectShape {

  // Each effect shape has a name, shape, live loop, and effect.
  readonly effect : Effect;
  constructor(public name : string, public shape : Shape, public liveLoopShape : LiveLoopShape) {
    /**
     * Update and uncomment following once we have updated version of Effect class.
     * this.effect = new Effect(this.liveLoopShape.liveloop, name);
     */
  }

  remove() {
    /**
     * Update and uncomment the following once we have updated version of Effect class.
     * this.effect.delete();
     */
  }

}
