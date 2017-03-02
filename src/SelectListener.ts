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
 * Listens for selection of meshes activated by the camera looking at a mesh.
 */
export default class SelectListener {
  selector: Selector;
  meshesToSubjects: WeakMap<THREE.Mesh, Subject<SelectListenerEvent>> = new WeakMap();

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.selector = new Selector(
      camera,
      scene,
      mesh => this.onSelect(mesh),
      mesh => this.onDeselect(mesh),
    );
  }

  observeSelections(mesh: THREE.Mesh) {
    return this.getMeshSubject(mesh).asObservable();
  }

  getMeshSubject(mesh: THREE.Mesh) {
    if (!this.meshesToSubjects.has(mesh)) {
      this.meshesToSubjects.set(mesh, new Subject());
    }

    return this.meshesToSubjects.get(mesh)!;
  }

  onSelect(mesh: THREE.Mesh) {
    this.getMeshSubject(mesh).next({
      selected: true,
    });
  }

  onDeselect(mesh: THREE.Mesh) {
    this.getMeshSubject(mesh).next({
      selected: false,
    });
  }

  update() {
    this.selector.updateSelectedMesh();
  }
}
