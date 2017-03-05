import THREE = require('three');
import { Observable } from 'rxjs';

interface OrientationEvent {
  quaternion: THREE.Quaternion;
  roll: number;
  pitch: number;
  yaw: number;
}

function getPitch(quat: THREE.Quaternion) {
  return Math.asin(Math.max(-1, Math.min(1, 2 * (quat.w * quat.y - quat.z * quat.x))));
}

function getRoll(quat: THREE.Quaternion) {
  return Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x ** 2 + quat.y ** 2));
}

function getYaw(quat: THREE.Quaternion) {
  return Math.atan2(2 * (quat.w * quat.z + quat.x * quat.y), 1 - 2 * (quat.y ** 2 + quat.z ** 2));
}

export function quaternionsToOrientations(quaternions: Observable<THREE.Quaternion>) {
  return quaternions.map<THREE.Quaternion, OrientationEvent>(quaternion => ({
    quaternion,
    roll: getRoll(quaternion),
    pitch: getPitch(quaternion),
    yaw: getYaw(quaternion),
  }));
}
