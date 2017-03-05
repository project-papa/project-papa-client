import THREE = require('three');
import SelectListener from 'src/SelectListener';
import { Observable } from 'rxjs';
import * as controls from 'src/controls';

/**
 * Allows meshes to be grabbed and released
 */
export default class Grabber {
  private selectListener: SelectListener;
  private grabbed: { grabbable: Grabbable, object: THREE.Object3D } | null = null;
  private camera: THREE.Camera;

  constructor(selectListener: SelectListener, camera: THREE.Camera) {
    this.selectListener = selectListener;
    this.camera = camera;
  }

  update() {
    if (this.grabbed) {
      this.grabbed.grabbable.onMove(this.grabbed.object, this.camera.getWorldDirection());
    }
  }

  addGrabbable(grabbable: Grabbable, lifetime: Observable<any>) {
    return controls.controlEvents.filter(controls.eventIs.fist)
      .withLatestFrom(this.selectListener.observeSelections(grabbable.grabbableObject), (fistEvent, selectionEvent) => ({ selectionEvent, fistEvent }))
      .filter(({ selectionEvent: { selected } }) => selected)
      .takeUntil(lifetime)
      .subscribe(({ fistEvent }) => {
        const grabbed = grabbable.onGrab(grabbable.grabbableObject);
        this.grabbed = {
          grabbable,
          object: grabbed,
        };
        fistEvent.observe().takeUntil(lifetime).subscribe({
          complete: () => {
            grabbable.onRelease(grabbed, this.camera.getWorldDirection());
            this.grabbed = null;
          },
        });
      });
  }
}

/**
 * Something that can be grabbed
 */
export interface Grabbable {
  /**
   * The object that can be grabbed. Is not necessarily the object
   * that gets pulled towards the user
   */
  grabbableObject: THREE.Object3D;

  /**
   * Called when grabbableObject is grabbed. Must return the object
   * that is pulled towards the user.
   */
  onGrab(object: THREE.Object3D): THREE.Object3D;

  /**
   * Called to update the position of the object that is pulled towards the user
   */
  onMove(object: THREE.Object3D, direction: THREE.Vector3): void;

  /**
   * Called when the object that is pulled towards the user is released.
   */
  onRelease(object: THREE.Object3D, direction: THREE.Vector3): void;
}
