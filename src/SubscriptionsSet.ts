import THREE = require('three');
import { Subscription } from 'rxjs';

import { Entity } from 'src/entities/entity';
import Subscriptions from './Subscriptions';
import { Selector } from 'src/selector';

/**
 * A mapping of entities to subscriptions.
 */
export default class SubscriptionsSet {
  private entitySubscriptions = new Map<Entity, Subscriptions>();
  private scene: THREE.Scene;
  private selector: Selector;

  constructor(scene: THREE.Scene, selector: Selector) {
    this.scene = scene;
    this.selector = selector;
  }

  addObjectForEntity(entity: Entity, object: THREE.Object3D) {
    this.getEntitySubscriptions(entity).addThreeObject(object);
  }

  getEntityLifetime(entity: Entity) {
    return this.getEntitySubscriptions(entity).getStop$();
  }

  addSelectorObject(entity: Entity, object: THREE.Object3D) {
    this.getEntitySubscriptions(entity).addSelectorObject(object);
  }

  releaseEntitySubscriptions(entity: Entity) {
    this.getEntitySubscriptions(entity).release();
    this.entitySubscriptions.delete(entity);
  }

  private getEntitySubscriptions(entity: Entity) {
    if (!this.entitySubscriptions.has(entity)) {
      this.entitySubscriptions.set(entity, new Subscriptions(this.scene, this.selector));
    }

    return this.entitySubscriptions.get(entity)!;
  }
}
