import { World } from 'src/world';

/**
 * Encapsulates a logical entity in a world. Can be removed and added
 */
export interface Entity {
  /**
   * Actions to perform when an entity is added to a particular world
   */
  onAdd(world: World): void;

  /**
   * Actions to perform when an entity is removed from a particular world
   */
  onRemove(world: World): void;

  /**
   * If present, is called on every update
   */
  onUpdate?(delta: number): void;
}
