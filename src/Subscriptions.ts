import THREE = require('three');
import { Subject } from 'rxjs';
import { Entity } from 'src/entities/entity';
import { Selector } from 'src/selector';

/**
 * Encapsulates a set of subscriptions to things in a world, so that they can all be released in one go
 */
export default class Subscriptions {
  private scene: THREE.Scene;
  private stop$ = new Subject<Object>();
  private threeObjects: THREE.Object3D[] = [];
  private selectableObjects: THREE.Object3D[] = [];
  private selector: Selector;

  constructor(scene: THREE.Scene, selector: Selector) {
    this.scene = scene;
    this.selector = selector;
  }

  addThreeObject(object: THREE.Object3D) {
    this.scene.add(object);
    this.threeObjects.push(object);
  }

  getStop$() {
    return this.stop$.asObservable();
  }

  addSelectorObject(object: THREE.Object3D) {
    this.selector.checkForObject(object);
    this.selectableObjects.push(object);
  }

  release() {
    for (const threeObject of this.threeObjects) {
      this.scene.remove(threeObject);
    }
    for (const selectableObject of this.selectableObjects) {
      this.selector.stopCheckingForObject(selectableObject);
    }
    this.threeObjects = [];
    this.selectableObjects = [];
    this.stop$.next({ });
    this.stop$.complete();
    this.stop$ = new Subject();
  }
}
