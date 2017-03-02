import THREE = require('three');

export function projectMeshDistanceFromCamera(camera: THREE.Camera, mesh: THREE.Mesh, distance: number) {
  const newPos = camera.position.add(camera.getWorldDirection().multiplyScalar(distance));
  mesh.position.set(
    newPos.x,
    newPos.y,
    newPos.z,
  );
}

export function setVectorFromVector(to: THREE.Vector3, from: THREE.Vector3) {
  to.set(from.x, from.y, from.z);
}
