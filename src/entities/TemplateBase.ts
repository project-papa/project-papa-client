import THREE = require('three');
import { Entity } from './entity';
import { World } from 'src/world';

/**
 * Flat base of the world where our templates lie
 */
export default class TemplateBase implements Entity {
  mesh: THREE.Mesh | null;

  onAdd(world: World) {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.5, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x999999, transparent: true, opacity: 0.7 }),
    );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, -1.5, 0);

    world.scene.add(this.mesh);
  }

  onRemove(world: World) {
    world.scene.remove(this.mesh!);
    this.mesh = null;
  }
}
