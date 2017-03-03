import THREE = require('three');

/**
 * Creates a reticle that we can add to the camera
 */
export default function createReticle() {
  const reticle = new THREE.Group();

  reticle.add(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.01, 20),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.7,
        transparent: true,
      }),
    ),
  );

  reticle.add(
    new THREE.Mesh(
      new THREE.RingGeometry(0.01, 0.015, 20),
      new THREE.MeshBasicMaterial({
        color: 0x111111,
        opacity: 1,
        transparent: true,
      }),
    ),
  );

  reticle.position.z = -2;

  return reticle;
}
