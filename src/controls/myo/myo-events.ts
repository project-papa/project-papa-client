import Myo = require('myo');
import { Observable } from 'rxjs';
import THREE = require('three');

Myo.connect('com.project-papa.vr');
Myo.on('connected', () => {
  Myo.setLockingPolicy('none');
});

export interface MyoPoseStart {
  type: 'start';
  name: Myo.PoseName;
}

export interface MyoPoseEnd {
  type: 'end';
  name: Myo.PoseOffName;
}

Myo.onError = (error: any) => {
  console.log('Error connecting to Myo', error);
};

export function getPoseStarts() {
  return new Observable<MyoPoseStart>(subscriber => {
    const listener = (name: Myo.PoseName) => {
      subscriber.next({ type: 'start', name });
    };

    Myo.on('pose', listener);

    return {
      unsubscribe() {
        Myo.off('pose', listener);
      },
    };
  }).share();
}

export function getPoseEnds() {
  return new Observable<MyoPoseEnd>(subscriber => {
    const listener = (name: Myo.PoseOffName) => {
      subscriber.next({ type: 'end', name });
    };

    Myo.on('pose_off', listener);

    return {
      unsubscribe() {
        Myo.off('pose_off', listener);
      },
    };
  }).share();
}

const correctingQuaternion = (new THREE.Quaternion()).setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  Math.PI / 2,
);

function myoToThreeQuaternion(quat: Myo.MyoQuaternion): THREE.Quaternion {
  // This conversion likely isn't the most efficient or most mathematically elegant
  // But it is easy to understand.
  const originalQuaternion = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
  const eulerAngles = (new THREE.Euler()).setFromQuaternion(originalQuaternion);
  // The Myo gives us rotations in a different co-ordinate space to our world.
  // The axes are jumbled, so we jumble them back
  eulerAngles.set(-eulerAngles.y, -eulerAngles.z, -eulerAngles.x);
  return (new THREE.Quaternion()).setFromEuler(eulerAngles);
}

export function getOrientation() {
  return new Observable<THREE.Quaternion>(subscriber => {
    const listener = (quaternion: Myo.MyoQuaternion) => {
      subscriber.next(myoToThreeQuaternion(quaternion));
    };

    Myo.on('orientation', listener);

    return {
      unsubscribe() {
        Myo.off('orientation', listener);
      },
    };
  });
}
