import THREE = require('three');
import { Entity } from './entity';
import { World } from 'src/world';

/**
 * Flat base of the world where our templates lie
 */
export default class TemplateBase implements Entity {
  mesh: THREE.Mesh;
  scene: THREE.Scene;

  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.5, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x444444, opacity: 0.8, transparent: true }),
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, -1.5, 0);
  }

  onAdd(world: World) {
    this.scene = world.scene;

    world.scene.add(this.mesh);
  }

  onRemove(world: World) {
    world.scene.remove(this.mesh);
  }
}
