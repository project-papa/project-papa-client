import * as THREE from 'three';

export class Box {
  geometry : THREE.BoxGeometry;
  material : THREE.MeshBasicMaterial;
  box : THREE.Mesh;
  constructor(public width : number, public height : number, public depth : number, public hexColor : number) {
    this.geometry = new THREE.BoxGeometry(width, height, depth);
    this.material = new THREE.MeshBasicMaterial ( {color : hexColor } );
    this.box = new THREE.Mesh(this.geometry, this.material);
  }
}

export function addBox(width : number, height : number, depth : number, color : number) {

  // Create scene:
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Create box, and add to scene:
  const box : Box = new Box(width, height, depth, color);

  scene.add(box.box);

  camera.position.z = 5;

  // Render scene:
  const render = function () {
    requestAnimationFrame( render );

    box.box.rotation.x += 0.1;
    box.box.rotation.y += 0.1;

    renderer.render(scene, camera);
  };

  render();
}
