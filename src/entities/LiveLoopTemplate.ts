import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import LiveLoopEntity, { LiveLoopEntityDefinition } from './LiveLoopEntity';
import { LiveLoopName } from 'src/generation/directory';
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
  getLiveLoopName(): LiveLoopName;
}

const liveLoopMaterial = new THREE.MeshPhongMaterial({
  color: 0xaaaaaa,
  specular: 0x69bccc,
  shininess: 10,
  shading: THREE.FlatShading,
  opacity: 0.8,
  transparent: true,
});

/**
 * A LiveLoopTemplate can be selected by the user to create a new live loop
 * in the world.
 */
export default class LiveLoopTemplate implements Entity {
  mesh: THREE.Mesh;
  subscription: Subscription;
  selected: boolean = false;
  definition: LiveLoopTemplateDefinition;
  meshToAdd: THREE.Mesh | null = null;
  world: World;

  constructor(definition: LiveLoopTemplateDefinition) {
    this.definition = definition;
    this.mesh = this.createMesh();

    this.mesh.position.set(
      definition.position.x,
      definition.position.y,
      definition.position.z,
    );
  }

  onAdd(world: World) {
    this.world = world;
    world.scene.add(this.mesh);
    this.subscription = new Subscription();
    this.subscription.add(
      world.selectListener
        .observeSelections(this.mesh)
        .subscribe(event => this.selected = event.selected),
    );
    this.subscription.add(
      controls.controlEvents
        .filter(controls.eventIs.fist)
        .subscribe(
          controls.listenPose({
            start: () => {
              console.log('fist');
              if (this.selected) {
                this.startMeshAdd();

                this.mesh.position.set(
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
      utils.projectMeshDistanceFromCamera(
        this.world.camera,
        this.meshToAdd,
        3,
      );
    }
  }

  onRemove(world: World) {
    world.scene.remove(this.mesh);
    this.subscription.unsubscribe();
    this.finishMeshAdd(false);
  }

  startMeshAdd() {
    this.meshToAdd = this.createMesh();
    console.log(this.meshToAdd === this.mesh);
    this.world.scene.add(this.meshToAdd);
  }

  finishMeshAdd(addLiveLoop = true) {
    if (this.meshToAdd) {
      if (addLiveLoop) {
        const liveLoopMesh = this.createMesh();
        utils.setVectorFromVector(liveLoopMesh.position, this.meshToAdd.position);

        this.world.scene.remove(this.meshToAdd);

        this.world.addEntity(new LiveLoopEntity({
          mesh: liveLoopMesh,
          name: this.definition.getLiveLoopName(),
        }));
      }

      this.meshToAdd = null;
    }
  }

  createMesh() {
    return new THREE.Mesh(
      this.definition.createGeometry(),
      liveLoopMaterial.clone(),
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
  getLiveLoopName() {
    return 'weird_vinyl';
  },
};

const ambientTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 0,
    y: -0.7,
    z: -1.5,
  },
  createGeometry() {
    return new THREE.BoxGeometry(0.5, 0.5, 0.5);
  },
  getLiveLoopName() {
    return 'weird_vinyl';
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
  getLiveLoopName() {
    return 'weird_vinyl';
  },
};

const percussiveTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 1.4,
    y: -1,
    z: -1.4,
  },
  createGeometry() {
    return new THREE.IcosahedronGeometry(0.5, 0);
  },
  getLiveLoopName() {
    return 'weird_vinyl';
  },
};

const bassTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: -1.2,
    y: -0.7,
    z: -1.2,
  },
  createGeometry() {
    return new THREE.DodecahedronGeometry(0.4, 0);
  },
  getLiveLoopName() {
    return 'weird_vinyl';
  },
};

export const templateDefinitions = {
  weird: weirdTemplateDefinition,
  bass: bassTemplateDefinition,
  percussive: percussiveTemplateDefinition,
  lead: leadTemplateDefinition,
  ambient: ambientTemplateDefinition,
};
