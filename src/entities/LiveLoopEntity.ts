import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import * as controls from 'src/controls';
import * as utils from './utils';
import THREE = require('three');
import { getEffect, LiveLoopCatagory } from 'src/generation/directory';
import LiveLoop from 'src/generation/LiveLoop';
import { SmoothValue, ExponentialAverage } from '../SmoothValue';
import { isGrabbedDirectionValid } from './LiveLoopTemplate';
import * as rxutils from 'src/rxutils';

export interface LiveLoopEntityDefinition {
  type: LiveLoopCatagory;
  mesh: THREE.Mesh;
  depth: number;
  direction: THREE.Vector3;
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
  direction: THREE.Vector3;
  depth: SmoothValue;

  dead : boolean = false;

  constructor(definition: LiveLoopEntityDefinition) {
    this.type = definition.type;
    this.amplitude = new ExponentialAverage(0.5, 0);
    this.coreMesh = definition.mesh;
    this.coreMesh.geometry.scale(0.8, 0.8, 0.8);
    this.direction = definition.direction;
    this.depth = new ExponentialAverage(0.5, definition.depth);
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
    this.depth.setTarget(5);

    world.selectListener
      .observeSelections(this.coreMesh)
      .takeUntil(this.world.getEntityLifetime(this))
      .subscribe(event => {
        this.selected = event.selected;
        if (this.selected) {
          (this.outlineMesh.material as THREE.MeshPhongMaterial).opacity = 0.6;
          controls.orientationEvents
            .takeUntil(this.world.getEntityLifetime(this))
            .takeWhile(() => this.selected)
            .map(orientation => (new THREE.Euler()).setFromQuaternion(orientation).z)
            .let(rxutils.lastTwo)
            .map(([prev, current]) =>
              Math.atan2(Math.sin(prev - current), Math.cos(prev - current)),
            )
            .subscribe(rotateAmount => {
              this.liveloop.setVolume(this.liveloop.getVolume() + rotateAmount);
            });
        } else {
          (this.outlineMesh.material as THREE.MeshPhongMaterial).opacity = 0.2;
        }
      });

    controls.controlEvents
      .takeUntil(this.world.getEntityLifetime(this))
      .filter(() => this.selected)
      .subscribe(event => {
        if (controls.eventIs.waveIn(event)) {
          this.liveloop.prevEffect();
          const currentEffectNum = this.liveloop.getEffectNum();
          this.applyEffectColour(currentEffectNum);
        } else if (controls.eventIs.waveOut(event)) {
          this.liveloop.nextEffect();
          const currentEffectNum = this.liveloop.getEffectNum();
          this.applyEffectColour(currentEffectNum);
        }
      });

    // Subscribe to live loop to get oscilloscope data to make LiveLoopEntity pulse with amplitude
    this.liveloop.oscilloscopeData()
      .takeUntil(this.world.getEntityLifetime(this))
      .subscribe(
        amplitude => {
          this.amplitude.setTarget(amplitude);
        },
      );

    this.world.grabber.addGrabbable({
      grabbableObject: this.coreMesh,
      onGrab: object => {
        this.depth.setTarget(4);
        return this.group;
      },
      onMove: (object, direction) => {
        this.direction = direction;
        if (!isGrabbedDirectionValid(direction)) {
          controls.feedback('short');
        }
      },
      onRelease: (object, direction) => {
        this.depth.setTarget(5);
        this.direction = direction;

        if (!isGrabbedDirectionValid(direction)) {
          this.kill();
        }
      },
    }, this.world.getEntityLifetime(this));
  }

  onUpdate(delta: number) {
    if (this.dead) {
      if (this.group.position.y > 100) {
        this.world.removeEntity(this);
      } else {
        utils.moveObjectUp(delta, 0.01, this.group);
      }
    } else {
      this.group.position.copy(this.direction.clone().multiplyScalar(this.depth.getValue()));
    }

    this.amplitude.update(delta);
    this.depth.update(delta);
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
