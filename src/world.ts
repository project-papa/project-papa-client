import * as THREE from 'three';
/* Uncomment once shape.ts exists:
import { Shape } from 'src/shape.ts';*/

export class World {

  // Each World will have a scene, camera, and renderer
  // (set up at construction time):
  // NOTE: These are private members.
  private scene : THREE.Scene;
  private camera : THREE.PerspectiveCamera;
  private renderer : THREE.WebGLRenderer;

  // Each World will also keep track of what shapes are currently in it:
  // NOTE: This is a private member.
  /* Uncomment once shape.ts exists:
  private shapes : Array<Shape>;*/

  constructor() {

    // Basic set up of scene, camera, and renderer:
    this.scene = new THREE.Scene();

    // NOTE: arguments to perspective camera are:
    // Field of view, aspect ratio, near and far clipping plane
    this.camera = new THREE.PerspectiveCamera( 75,
      window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // Add to HTML:
    document.body.appendChild( this.renderer.domElement );

  }

  // Public methods:

  // Add shape to world:
  /* Uncomment once shape.ts exists:
  addShape (shape : Shape) {
    // First add to scene:
    this.scene.add(Shape);
    // Then add to shapes array:
    this.shapes.push(Shape);
  }*/

  // Render world:
  render = function () {
    requestAnimationFrame( this.render );
    this.renderer.render(this.scene, this.camera);
  };

}
