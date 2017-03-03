import THREE = require('three');
import { Subscription } from 'rxjs';
import { Entity } from 'src/entities/entity';
import { Selector } from 'src/selector';

/**
 * Encapsulates a set of subscriptions to things in a world, so that they can all be released in one go
 */
export default class Subscriptions {
  private scene: THREE.Scene;
  private observableSubscription: Subscription = new Subscription();
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

  addObservableSubscription(subscription: Subscription) {
    this.observableSubscription.add(subscription);
  }

  addSelectorObject(object: THREE.Object3D) {
    this.selector.checkForObject(object);
    this.selectableObjects.push(object);
  }

  release() {
    this.observableSubscription.unsubscribe();
    for (const threeObject of this.threeObjects) {
      this.scene.remove(threeObject);
    }
    for (const selectableObject of this.selectableObjects) {
      this.selector.stopCheckingForObject(selectableObject);
    }
    this.threeObjects = [];
    this.selectableObjects = [];
    this.observableSubscription = new Subscription();
  }
}
