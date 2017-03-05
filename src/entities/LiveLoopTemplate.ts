import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import LiveLoopEntity, { LiveLoopEntityDefinition } from './LiveLoopEntity';
import { LiveLoopCatagory } from 'src/generation/directory';
import * as controls from 'src/controls';
import * as utils from './utils';
import THREE = require('three');

interface LiveLoopTemplateDefinition {
  position: {
    x: number;
    y: number;
    z: number;
  };
  createGeometry(): THREE.Geometry;
  getLiveLoopCatagory(): LiveLoopCatagory;
}

function createLiveLoopMaterial(color: number, opacity: number) {
  return new THREE.MeshPhongMaterial({
    color: color,
    shininess: 1,
    specular: 0x444488,
    shading: THREE.FlatShading,
    opacity: opacity,
    transparent: true,
  });
}

function createBase() {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.001, 20),
    new THREE.MeshLambertMaterial({
      color: 0x111111,
    }),
  );
  base.position.setY(-1.2);

  return base;
}

/**
 * A LiveLoopTemplate can be selected by the user to create a new live loop
 * in the world.
 */
export default class LiveLoopTemplate implements Entity {
  mesh: THREE.Mesh;
  group: THREE.Group;
  selected: boolean = false;
  definition: LiveLoopTemplateDefinition;
  meshToAdd: THREE.Mesh | null = null;
  world: World;

  constructor(definition: LiveLoopTemplateDefinition) {
    this.definition = definition;

    this.group = new THREE.Group();

    this.mesh = this.createMesh(0x333333, 0.8);
    this.mesh.position.setY(-0.7);
    this.mesh.scale.set(0.5, 0.5, 0.5);
    this.group.add(this.mesh);
    this.group.add(createBase());
    this.group.position.set(
      definition.position.x,
      0,
      definition.position.z,
    );
  }

  onAdd(world: World) {
    this.world = world;
    this.world.addObjectForEntity(this, this.group);
    this.world.addSelectorObject(this, this.mesh);
    world.selectListener
      .observeSelections(this.mesh)
      .takeUntil(this.world.getEntityLifetime(this))
      .subscribe(event => {
        this.selected = event.selected;
        if (this.selected) {
          this.mesh.scale.set(0.6, 0.6, 0.6);
        } else {
          this.mesh.scale.set(0.5, 0.5, 0.5);
        }
      });

    this.world.grabber.addGrabbable({
      grabbableObject: this.mesh,
      onGrab: object => {
        const mesh = this.createMesh(0xaaaaaa, 0.5);
        this.world.addObjectForEntity(this, mesh);
        return mesh;
      },
      onMove: (object, direction) => {
        object.position.copy(direction.multiplyScalar(1.5));
      },
      onRelease: (object, direction) => {
        const liveLoopMesh = this.createMesh(0xaaaaaa, 1);

        this.world.scene.remove(object);

        this.world.addEntity(new LiveLoopEntity({
          mesh: liveLoopMesh,
          type: this.definition.getLiveLoopCatagory(),
          direction: direction,
          depth: 1.5,
        }));
      },
    }, this.world.getEntityLifetime(this));
  }

  onUpdate(delta: number) {
    if (this.selected) {
      this.mesh.rotateY(delta * 0.00025);
      (this.mesh.material as THREE.MeshPhongMaterial).opacity = 1;
    } else {
      (this.mesh.material as THREE.MeshPhongMaterial).opacity = 0.8;
    }
  }

  createMesh(color: number, opacity: number) {
    return new THREE.Mesh(
      this.definition.createGeometry(),
      createLiveLoopMaterial(color, opacity),
    );
  }
}

const weirdTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 1.5,
    y: -0.7,
    z: 0,
  },
  createGeometry() {
    return new THREE.TetrahedronGeometry(0.5);
  },
  getLiveLoopCatagory() {
    return 'weird';
  },
};

const ambientTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 0,
    y: -0.7,
    z: -1.5,
  },
  createGeometry() {
    return new THREE.BoxGeometry(0.5, 0.5, 0.5).rotateX(Math.PI / 4).rotateZ(Math.PI / 4).rotateY(Math.PI / 4);
  },
  getLiveLoopCatagory() {
    return 'ambient';
  },
};

const leadTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: -1.5,
    y: -0.5,
    z: 0,
  },
  createGeometry() {
    return new THREE.OctahedronGeometry(0.4, 0);
  },
  getLiveLoopCatagory() {
    return 'lead';
  },
};

const drumsTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 1,
    y: -1,
    z: -1,
  },
  createGeometry() {
    return new THREE.IcosahedronGeometry(0.5, 0);
  },
  getLiveLoopCatagory() {
    return 'drums';
  },
};

const bassTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: -1,
    y: -0.7,
    z: -1,
  },
  createGeometry() {
    return new THREE.DodecahedronGeometry(0.4, 0);
  },
  getLiveLoopCatagory() {
    return 'bass';
  },
};

export const templateDefinitions = {
  weird: weirdTemplateDefinition,
  bass: bassTemplateDefinition,
  drums: drumsTemplateDefinition,
  lead: leadTemplateDefinition,
  ambient: ambientTemplateDefinition,
};
