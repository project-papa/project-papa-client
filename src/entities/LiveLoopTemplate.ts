import { Entity } from './entity';
import { World } from 'src/world';
import THREE = require('three');
import { LiveLoopName } from 'src/generation/directory';

interface LiveLoopTemplateDefinition {
  position: {
    x: number;
    y: number;
    z: number;
  };
  createGeometry(): THREE.Geometry;
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

  constructor(definition: LiveLoopTemplateDefinition) {
    this.mesh = new THREE.Mesh(
      definition.createGeometry(),
      liveLoopMaterial,
    );

    this.mesh.position.set(
      definition.position.x,
      definition.position.y,
      definition.position.z,
    );
  }

  onAdd(world: World) {
    world.scene.add(this.mesh);
  }

  onRemove(world: World) {
    world.scene.remove(this.mesh);
  }
}

const weirdTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 0,
    y: -0.7,
    z: -1.5,
  },
  createGeometry() {
    return new THREE.TetrahedronGeometry(0.5);
  },
};

const ambientTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 1.2,
    y: -0.7,
    z: -1.2,
  },
  createGeometry() {
    return new THREE.BoxGeometry(0.5, 0.5, 0.5);
  },
};

const leadTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: 1.5,
    y: -0.7,
    z: 0,
  },
  createGeometry() {
    return new THREE.OctahedronGeometry(0.4, 0);
  },
};

const percussiveTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: -1.2,
    y: -0.7,
    z: -1.2,
  },
  createGeometry() {
    return new THREE.IcosahedronGeometry(0.5, 0);
  },
};

const bassTemplateDefinition: LiveLoopTemplateDefinition = {
  position: {
    x: -1.5,
    y: -0.7,
    z: 0,
  },
  createGeometry() {
    return new THREE.DodecahedronGeometry(0.4, 0);
  },
};

export const templateDefinitions = {
  weird: weirdTemplateDefinition,
  bass: bassTemplateDefinition,
  percussive: percussiveTemplateDefinition,
  lead: leadTemplateDefinition,
  ambient: ambientTemplateDefinition,
};
