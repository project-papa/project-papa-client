import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import * as controls from 'src/controls';
import * as utils from './utils';
import THREE = require('three');
import { getEffect, LiveLoopCatagory } from 'src/generation/directory';
import LiveLoop from 'src/generation/LiveLoop';
import { SmoothValue, ExponentialAverage } from '../SmoothValue';
import * as rxutils from 'src/rxutils';

export interface LiveLoopEntityDefinition {
  type: LiveLoopCatagory;
  mesh: THREE.Mesh;
}

function createVolumeMesh() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.05),
    new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
    }),
  );

  mesh.position.setY(-0.6);

  return mesh;
}

/**
 * A LiveLoopEntity is made when a LiveLoopTemplate is selected in the world.
 * The LiveLoopEntity actually plays the live loop.
 */
export default class LiveLoopEntity implements Entity {
  type: LiveLoopCatagory;
  group: THREE.Group;
  shapeGroup: THREE.Group;
  coreMesh: THREE.Mesh;
  volumeMesh: THREE.Mesh;
  outlineMesh: THREE.Mesh;
  liveloop: LiveLoop;
  selected: boolean = false;
  fisted: boolean = false;
  world: World;
  amplitude: SmoothValue;

  dead : boolean = false;

  constructor(definition: LiveLoopEntityDefinition) {
    this.type = definition.type;
    this.amplitude = new ExponentialAverage(0.5, 0);
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

    this.volumeMesh = createVolumeMesh();

    this.group = new THREE.Group();
    this.group.position.copy(this.coreMesh.position);
    this.shapeGroup = new THREE.Group();
    this.coreMesh.position.set(0, 0, 0);
    this.outlineMesh.position.set(0, 0, 0);
    this.shapeGroup.add(this.coreMesh);
    this.shapeGroup.add(this.outlineMesh);
    this.group.add(this.shapeGroup);
    this.group.add(this.volumeMesh);
  }

  onAdd(world: World) {
    world.addObjectForEntity(this, this.group);
    world.addSelectorObject(this, this.coreMesh);
    this.liveloop = new LiveLoop(this.type);
    this.world = world;

    world.addSubscriptionForEntity(
      this,
      world.selectListener
        .observeSelections(this.coreMesh)
        .subscribe(event => {
          this.selected = event.selected;
          if (this.selected) {
            (this.outlineMesh.material as THREE.MeshPhongMaterial).opacity = 0.6;
            world.addSubscriptionForEntity(
              this,
              controls.orientationEvents
                .takeWhile(() => this.selected)
                .map(({ roll }) => roll)
                .let(rxutils.difference)
                .subscribe(rotateAmount => {
                  this.liveloop.setVolume(this.liveloop.getVolume() - rotateAmount);
                }),
            );
          } else {
            (this.outlineMesh.material as THREE.MeshPhongMaterial).opacity = 0.2;
          }
        }),
    );

    world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(() => this.selected)
        .subscribe(event => {
          if (controls.eventIs.fist(event)) {
            this.fisted = true;
            event.observe().subscribe(() => this.fisted = false);
          } else if (controls.eventIs.spread(event)) {
            this.kill();
          } else if (controls.eventIs.waveIn(event)) {
            this.liveloop.prevEffect();
            const currentEffectNum = this.liveloop.getEffectNum();
            this.applyEffectColour(currentEffectNum);
          } else if (controls.eventIs.waveOut(event)) {
            this.liveloop.nextEffect();
            const currentEffectNum = this.liveloop.getEffectNum();
            this.applyEffectColour(currentEffectNum);
          }
        }),
    );

    // Subscribe to live loop to get oscilloscope data to make LiveLoopEntity pulse with amplitude
    world.addSubscriptionForEntity(
      this,
      this.liveloop.oscilloscopeData().subscribe(
        amplitude => {
          this.amplitude.updateTarget(amplitude);
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

    this.amplitude.update(delta);
    const scale = 1.1 + this.amplitude.getValue() * 1.5;
    this.outlineMesh.scale.set(scale, scale, scale);
    this.volumeMesh.visible = this.selected;

    if (this.selected) {
      this.volumeMesh.quaternion.copy(this.world.camera.quaternion);
      this.volumeMesh.scale.set(0.01 + this.liveloop.getVolume() * 0.99, 1, 1);
    }

    this.shapeGroup.rotateY(delta * 0.001);
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
