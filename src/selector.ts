import * as THREE from 'three';
import * as controls from 'src/controls';

const voidFunction = () => undefined;

export class Selector {
  // Private properties
  private rayCaster : THREE.Raycaster;
  private camera : THREE.Camera;
  private scene : THREE.Scene;

  // Represents the currently selected mesh
  // Note may be undefined (i.e. no mesh selected)
  private selectedObject? : THREE.Object3D;

  // Functions for callbacks on mesh selection and deselection
  selectObject: (object: THREE.Object3D) => void;
  deselectObject: (object: THREE.Object3D) => void;

  // Functions for callbacks on fist gestures
  onFistStart: (object: THREE.Object3D) => void;
  onFistEnd: (object: THREE.Object3D) => void;

  // Functions for callbacks on wave gestures
  onWaveInStart: (object: THREE.Object3D) => void;
  onWaveInEnd: (object: THREE.Object3D) => void;

  onWaveOutStart: (object: THREE.Object3D) => void;
  onWaveOutEnd: (object: THREE.Object3D) => void;

  // Functions for callbacks on spread gesture
  onSpreadStart: (object: THREE.Object3D) => void;
  onSpreadEnd: (object: THREE.Object3D) => void;

  private objectsToCheck: THREE.Object3D[] = [];

  // Public methods

  /**
   * Constructor takes a camera to set up raytracer
   * and scene from which meshes can be selected
   */
  constructor(camera: THREE.Camera,
              scene: THREE.Scene,
              onObjectSelected: (mesh: THREE.Object3D) => void = voidFunction,
              onObjectDeselected: (mesh: THREE.Object3D) => void = voidFunction,
              onFistStart: (mesh: THREE.Object3D) => void = voidFunction,
              onFistEnd: (mesh: THREE.Object3D) => void = voidFunction,
              onWaveInStart: (mesh: THREE.Object3D) => void = voidFunction,
              onWaveInEnd: (mesh: THREE.Object3D) => void = voidFunction,
              onWaveOutStart: (mesh: THREE.Object3D) => void = voidFunction,
              onWaveOutEnd: (mesh: THREE.Object3D) => void = voidFunction,
              onSpreadStart: (mesh: THREE.Object3D) => void = voidFunction,
              onSpreadEnd: (mesh: THREE.Object3D) => void = voidFunction) {
    this.camera = camera;
    this.scene = scene;

    this.rayCaster = new THREE.Raycaster();

    this.selectObject = onObjectSelected;
    this.deselectObject = onObjectDeselected;

    // Initialize callback functions for gestures
    this.onFistStart = onFistStart;
    this.onFistEnd = onFistEnd;
    this.onWaveInStart = onWaveInStart;
    this.onWaveInEnd = onWaveInEnd;
    this.onWaveOutStart = onWaveOutStart;
    this.onWaveOutEnd = onWaveOutEnd;
    this.onSpreadStart = onSpreadStart;
    this.onSpreadEnd = onSpreadEnd;

    // Listen for fist gestures
    controls.controlEvents
      .filter(controls.eventIs.fist)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh first
          if (this.selectedObject) {
            this.onFistStart(this.selectedObject);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedObject) {
            this.onFistEnd(this.selectedObject);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.waveIn)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedObject) {
            this.onWaveInStart(this.selectedObject);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedObject) {
            this.onWaveInEnd(this.selectedObject);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.waveOut)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedObject) {
            this.onWaveOutStart(this.selectedObject);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedObject) {
            this.onWaveOutEnd(this.selectedObject);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.spread)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedObject) {
            this.onSpreadStart(this.selectedObject);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedObject) {
            this.onSpreadEnd(this.selectedObject);
          }
        },
      }));
  }

  checkForObject(object: THREE.Object3D) {
    if (!this.objectsToCheck.includes(object)) {
      this.objectsToCheck.push(object);
    }
  }

  stopCheckingForObject(object: THREE.Object3D) {
    const objectIndex = this.objectsToCheck.indexOf(object);

    if (objectIndex !== -1) {
      this.objectsToCheck.splice(objectIndex, 1);
    }
  }

  /**
   * Returns the currently selected Object3D
   */
  getSelectedMesh() {
    return this.selectedObject;
  }

  setSelectedMesh(mesh : THREE.Mesh) {
    this.selectedObject = mesh;
  }
  /**
    * Method returns the Object3D hit by a raycast
    * Provided with a bool to check whether any Object3D
    * was hit at all
  */
  updateSelectedObject() {
    // Update picking ray with camera and position
    // Position (0,0) casts ray from centre of screen
    // This seems to work fine for now
    this.rayCaster.setFromCamera(
      { x : 0, y : 0 },
      this.camera,
    );

    // Get array of intersected objects
    const intersects = this.rayCaster.intersectObjects(this.objectsToCheck);

    // Check if raycaster intersects
    if (intersects[0]) {
      if (this.selectedObject) {
        // Check if the Object3D is not the one already selected
        if (intersects[0].object !== this.selectedObject) {
          // Deselect the Object3D and update the selected Object3D to the new one
          this.deselectObject(this.selectedObject);
          this.selectedObject = intersects[0].object;
          this.selectObject(this.selectedObject);
        }
      } else {
        this.selectedObject = intersects[0].object;
        this.selectObject(this.selectedObject);
      }
    } else { // No intersection with a Object3D
      if (this.selectedObject !== undefined) {
        this.deselectObject(this.selectedObject);
        this.selectedObject = undefined;
      }
    }
  }
}
