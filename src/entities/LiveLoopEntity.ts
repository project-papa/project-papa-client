import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import * as controls from 'src/controls';
import * as utils from './utils';
import THREE = require('three');
import { getEffect, LiveLoopCatagory } from 'src/generation/directory';
import LiveLoop from 'src/generation/LiveLoop';

export interface LiveLoopEntityDefinition {
  type: LiveLoopCatagory;
  mesh: THREE.Mesh;
}

/**
 * A LiveLoopEntity is made when a LiveLoopTemplate is selected in the world.
 * The LiveLoopEntity actually plays the live loop.
 */
export default class LiveLoopEntity implements Entity {
  type: LiveLoopCatagory;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  outlineMesh: THREE.Mesh;
  liveloop: LiveLoop;
  selected: boolean = false;
  fisted: boolean = false;
  world: World;

  dead : boolean = false;

  constructor(definition: LiveLoopEntityDefinition) {
    this.type = definition.type;
    this.coreMesh = definition.mesh;
    this.coreMesh.geometry.scale(0.8, 0.8, 0.8);
    this.outlineMesh = new THREE.Mesh(
      (this.coreMesh.geometry.clone() as THREE.Geometry),
      new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        opacity: 0.2,
        transparent: true,
      }),
    );

    this.group = new THREE.Group();
    utils.setVectorFromVector(this.group.position, this.coreMesh.position);
    this.coreMesh.position.set(0, 0, 0);
    this.outlineMesh.position.set(0, 0, 0);
    this.group.add(this.coreMesh);
    this.group.add(this.outlineMesh);
  }

  onAdd(world: World) {
    world.addObjectForEntity(this, this.group);
    world.addSelectorObject(this, this.coreMesh);
    this.liveloop = new LiveLoop(this.type);
    world.addSubscriptionForEntity(
      this,
      world.selectListener
        .observeSelections(this.coreMesh)
        .subscribe(event => this.selected = event.selected),
    );

    world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(controls.eventIs.fist)
        .subscribe(controls.listenPose({
          start: () => {
            if (this.selected) {
              this.fisted = true;
            }
          },
          finish: () => {
            this.fisted = false;
          },
        })),
    );

    world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(controls.eventIs.waveIn)
        .subscribe(event => {
          if (this.selected) {
            // Previous effect
            this.liveloop.prevEffect();
            const currentEffectNum = this.liveloop.getEffectNum();
            this.applyEffectColour(currentEffectNum);
          }
        }),
    );

    world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(controls.eventIs.waveOut)
        .subscribe(event => {
          if (this.selected) {
            // Add effect
            this.liveloop.nextEffect();
            const currentEffectNum = this.liveloop.getEffectNum();
            this.applyEffectColour(currentEffectNum);
          }
        }),
    );

    world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(controls.eventIs.spread)
        .subscribe(event => {
          if (this.selected) {
            this.kill();
          }
        }),
    );

    this.world = world;

    /**
     * Subscribe to live loop to get oscilloscope data to make LiveLoopEntity
     * pulse with amplitude.
     */
    world.addSubscriptionForEntity(
      this,
      this.liveloop.oscilloscopeData().subscribe(
        amplitude => {
          const scale = 1.1 + amplitude * 1.5;
          this.outlineMesh.scale.set(scale, scale, scale);
        },
      ),
    );
  }

  onUpdate(delta: number) {
    if (this.fisted) {
      utils.projectObjectDistanceFromCamera(this.world.camera, this.group, 3);
    } else if (this.dead) {
      if (this.group.position.y > 100) {
        this.world.removeEntity(this);
      } else {
        utils.moveObjectUp(delta, 0.01, this.group);
      }
    }

    this.group.rotateY(delta * 0.001);
  }

  onRemove(world: World) {
    if (!this.dead) {
      this.kill();
    }
  }

  kill() {
    this.dead = true;
    this.liveloop.delete();
  }

  applyEffectColour(index: number) {
    const col = getEffect(index).colour;
    (this.coreMesh.material as THREE.MeshPhongMaterial).color.setHex(col);
  }
}
