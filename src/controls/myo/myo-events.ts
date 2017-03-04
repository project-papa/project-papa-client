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

export function getOrientation() {
  return new Observable<THREE.Quaternion>(subscriber => {
    const listener = (quaternion: Myo.MyoQuaternion) => {
      subscriber.next(new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
    };

    Myo.on('orientation', listener);

    return {
      unsubscribe() {
        Myo.off('orientation', listener);
      },
    };
  });
}
