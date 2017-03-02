import THREE = require('three');
import { Subscription } from 'rxjs';

import { Entity } from 'src/entities/entity';
import Subscriptions from './Subscriptions';

/**
 * A mapping of entities to subscriptions.
 */
export default class SubscriptionsSet {
  private entitySubscriptions = new Map<Entity, Subscriptions>();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addObjectForEntity(entity: Entity, object: THREE.Object3D) {
    this.getEntitySubscriptions(entity).addThreeObject(object);
  }

  addSubscriptionForEntity(entity: Entity, subscription: Subscription) {
    this.getEntitySubscriptions(entity).addObservableSubscription(subscription);
  }

  releaseEntitySubscriptions(entity: Entity) {
    this.getEntitySubscriptions(entity).release();
    this.entitySubscriptions.delete(entity);
  }

  private getEntitySubscriptions(entity: Entity) {
    if (!this.entitySubscriptions.has(entity)) {
      this.entitySubscriptions.set(entity, new Subscriptions(this.scene));
    }

    return this.entitySubscriptions.get(entity)!;
  }
}
