import { Entity } from './entity';
import { World } from 'src/world';
import { Subscription } from 'rxjs';
import { controlEvents, eventIs } from 'src/controls';
import THREE = require('three');
import { LiveLoopName } from 'src/generation/directory';
import LiveLoop from 'src/generation/LiveLoop';

export interface LiveLoopEntityDefinition {
  name: LiveLoopName;
  mesh: THREE.Mesh;
}

/**
 * A LiveLoopEntity is made when a LiveLoopTemplate is selected in the world.
 * The LiveLoopEntity actually plays the live loop.
 */
export default class LiveLoopEntity implements Entity {
  name: LiveLoopName;
  mesh: THREE.Mesh;
  liveloop: LiveLoop;
  subscription: Subscription;
  selected: boolean = false;
  amplitude: number = 0.5;

  constructor(definition: LiveLoopEntityDefinition) {
    this.name = definition.name;
    this.mesh = definition.mesh;
  }

  onAdd(world: World) {
    world.scene.add(this.mesh);
    this.liveloop = new LiveLoop(this.name);
    this.subscription = new Subscription();
    this.subscription.add(
      world.selectListener
        .observeSelections(this.mesh)
        .subscribe(event => this.selected = event.selected),
    );
    this.subscription.add(
      controlEvents
        .filter(eventIs.fist)
        .subscribe(event => {
          if (this.selected) {
            console.log('FIST ON ME!');
            // TODO: add effect changes here(?)
          }
        }),
    );
    /**
     * Subscribe to live loop to get oscilloscope data to make LiveLoopEntity
     * pulse with amplitude.
     */
    this.liveloop.oscilloscopeData().subscribe(
      amplitude => {
        const oldAmp = this.amplitude;
        const factor = amplitude / oldAmp;
        this.mesh.geometry.scale(factor, factor, factor);
        this.amplitude = amplitude;
      },
    );
  }

  onRemove(world: World) {
    world.scene.remove(this.mesh);
    this.liveloop.delete();
    this.subscription.unsubscribe();
  }
}
