import THREE = require('three');

export function projectObjectDistanceFromCamera(camera: THREE.Camera, object: THREE.Object3D, distance: number) {
  const newPos = camera.position.add(camera.getWorldDirection().multiplyScalar(distance));
  object.position.set(
    newPos.x,
    newPos.y,
    newPos.z,
  );
}

export function setVectorFromVector(to: THREE.Vector3, from: THREE.Vector3) {
  to.set(from.x, from.y, from.z);
}

export function moveObjectUp(delta : number, scale : number, object : THREE.Object3D) {
  object.position.add(
    new THREE.Vector3(
      0,
      delta * scale,
      0,
    ),
  );
}
