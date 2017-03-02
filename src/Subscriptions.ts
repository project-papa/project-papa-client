import THREE = require('three');
import { Subscription } from 'rxjs';
import { Entity } from 'src/entities/entity';

/**
 * Encapsulates a set of subscriptions to things in a world, so that they can all be released in one go
 */
export default class Subscriptions {
  private scene: THREE.Scene;
  private observableSubscription: Subscription = new Subscription();
  private threeObjects: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addThreeObject(object: THREE.Object3D) {
    this.scene.add(object);
    this.threeObjects.push(object);
  }

  addObservableSubscription(subscription: Subscription) {
    this.observableSubscription.add(subscription);
  }

  release() {
    this.observableSubscription.unsubscribe();
    for (const threeObject of this.threeObjects) {
      this.scene.remove(threeObject);
    }
    this.threeObjects = [];
    this.observableSubscription = new Subscription();
  }
}
