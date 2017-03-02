import THREE = require('three');
import { Subject } from 'rxjs';
import { Selector } from 'src/selector';

interface SelectionEvent {
  selected: true;
}

interface DeselectionEvent {
  selected: false;
}

type SelectListenerEvent = SelectionEvent | DeselectionEvent;

/**
 * Listens for selection of objectes activated by the camera looking at a object.
 */
export default class SelectListener {
  selector: Selector;
  objectsToSubjects: WeakMap<THREE.Object3D, Subject<SelectListenerEvent>> = new WeakMap();

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.selector = new Selector(
      camera,
      scene,
      object => this.onSelect(object),
      object => this.onDeselect(object),
    );
  }

  observeSelections(object: THREE.Object3D) {
    return this.getObjectSubject(object).asObservable();
  }

  getObjectSubject(object: THREE.Object3D) {
    if (!this.objectsToSubjects.has(object)) {
      this.objectsToSubjects.set(object, new Subject());
    }

    return this.objectsToSubjects.get(object)!;
  }

  onSelect(object: THREE.Object3D) {
    this.getObjectSubject(object).next({
      selected: true,
    });
  }

  onDeselect(object: THREE.Object3D) {
    this.getObjectSubject(object).next({
      selected: false,
    });
  }

  update() {
    this.selector.updateSelectedObject();
  }
}
