import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import * as controls from 'src/controls';
import * as utils from './utils';
import THREE = require('three');
import { getEffect, LiveLoopCatagory } from 'src/generation/directory';
import LiveLoop from 'src/generation/LiveLoop';

/**
 * Gives the user some spatial awareness and global visualisation
 */
export default class GridEntity implements Entity {
  grid: THREE.GridHelper;

  constructor() {
    this.grid = new THREE.GridHelper(180, 100, 0xcccccc, 0xcccccc);
    this.grid.position.set(0, -4, 0);
  }

  onAdd(world: World) {
    world.addObjectForEntity(this, this.grid);
  }
}
