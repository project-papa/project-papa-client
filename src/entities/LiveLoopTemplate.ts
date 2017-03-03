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
    this.world.addSubscriptionForEntity(
      this,
      world.selectListener
        .observeSelections(this.mesh)
        .subscribe(event => {
          this.selected = event.selected;
          if (this.selected) {
            this.mesh.scale.set(0.6, 0.6, 0.6);
          } else {
            this.mesh.scale.set(0.5, 0.5, 0.5);
          }
        }),
    );
    this.world.addSubscriptionForEntity(
      this,
      controls.controlEvents
        .filter(controls.eventIs.fist)
        .subscribe(
          controls.listenPose({
            start: () => {
              if (this.selected) {
                this.startMeshAdd();

                this.meshToAdd!.position.set(
                  this.definition.position.x,
                  this.definition.position.y,
                  this.definition.position.z,
                );
              }
            },
            finish: () => {
              this.finishMeshAdd();
            },
          }),
        ),
    );
  }

  onUpdate(delta: number) {
    if (this.meshToAdd) {
      utils.projectObjectDistanceFromCamera(
        this.world.camera,
        this.meshToAdd,
        3,
      );
    }
    if (this.selected) {
      this.mesh.rotateY(delta * 0.00025);
      (this.mesh.material as THREE.MeshPhongMaterial).opacity = 1;
    } else {
      (this.mesh.material as THREE.MeshPhongMaterial).opacity = 0.8;
    }
  }

  startMeshAdd() {
    this.meshToAdd = this.createMesh(0xaaaaaa, 0.5);
    this.world.addObjectForEntity(this, this.meshToAdd);
  }

  finishMeshAdd(addLiveLoop = true) {
    if (this.meshToAdd) {
      if (addLiveLoop) {
        const liveLoopMesh = this.createMesh(0xaaaaaa, 1);
        utils.setVectorFromVector(liveLoopMesh.position, this.meshToAdd.position);

        this.world.scene.remove(this.meshToAdd);

        this.world.addEntity(new LiveLoopEntity({
          mesh: liveLoopMesh,
          type: this.definition.getLiveLoopCatagory(),
        }));
      }

      this.meshToAdd = null;
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
