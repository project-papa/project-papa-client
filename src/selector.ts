import * as THREE from 'three';
import * as controls from 'src/controls';

export class Selector {
  // Private properties
  private rayCaster : THREE.Raycaster;
  private camera : THREE.Camera;
  private scene : THREE.Scene;

  // Represents the currently selected mesh
  // Note may be undefined (i.e. no mesh selected)
  private selectedMesh? : THREE.Mesh;

  // Functions for callbacks on mesh selection and deselection
  selectMesh : (mesh : THREE.Mesh) => void;
  deselectMesh : (mesh : THREE.Mesh) => void;

  // Functions for callbacks on fist gestures
  onFistStart: (mesh : THREE.Mesh) => void;
  onFistEnd: (mesh : THREE.Mesh) => void;

  // Functions for callbacks on wave gestures
  onWaveInStart: (mesh : THREE.Mesh) => void;
  onWaveInEnd: (mesh : THREE.Mesh) => void;

  onWaveOutStart: (mesh : THREE.Mesh) => void;
  onWaveOutEnd: (mesh : THREE.Mesh) => void;

  // Functions for callbacks on spread gesture
  onSpreadStart: (mesh : THREE.Mesh) => void;
  onSpreadEnd: (mesh : THREE.Mesh) => void;

  // Properties regarding moving and projecting the mesh
  private isMoving = false;
  private isProjecting = false;
  private projectingMesh? : THREE.Mesh;
  private projectionDirection = new THREE.Vector3(0, 0, 0);
  private movingMesh? : THREE.Mesh;

  // Public methods

  /**
   * Constructor takes a camera to set up raytracer
   * and scene from which meshes can be selected
   */
  constructor(camera : THREE.Camera,
              scene : THREE.Scene,
              crosshair : THREE.Mesh,
              onMeshSelected : (mesh : THREE.Mesh) => void,
              onMeshDeselected : (mesh : THREE.Mesh) => void,
              onFistStart : (mesh : THREE.Mesh) => void,
              onFistEnd : (mesh : THREE.Mesh) => void,
              onWaveInStart: (mesh : THREE.Mesh) => void,
              onWaveInEnd : (mesh : THREE.Mesh) => void,
              onWaveOutStart: (mesh : THREE.Mesh) => void,
              onWaveOutEnd: (mesh : THREE.Mesh) => void,
              onSpreadStart: (mesh : THREE.Mesh) => void,
              onSpreadEnd: (mesh : THREE.Mesh) => void) {
    this.camera = camera;
    this.scene = scene;

    this.rayCaster = new THREE.Raycaster();

    this.selectMesh = onMeshSelected;
    this.deselectMesh = onMeshDeselected;

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
          if (this.selectedMesh) {
            this.onFistStart(this.selectedMesh);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedMesh) {
            this.onFistEnd(this.selectedMesh);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.waveIn)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedMesh) {
            this.onWaveInStart(this.selectedMesh);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedMesh) {
            this.onWaveInEnd(this.selectedMesh);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.waveOut)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedMesh) {
            this.onWaveOutStart(this.selectedMesh);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedMesh) {
            this.onWaveOutEnd(this.selectedMesh);
          }
        },
      }));

    controls.controlEvents
      .filter(controls.eventIs.spread)
      .subscribe(controls.listenPose({
        start: () => {
          // Check we have selected a mesh
          if (this.selectedMesh) {
            this.onSpreadStart(this.selectedMesh);
          }
        },
        finish: () => {
          // Check we have selected a mesh first
          if (this.selectedMesh) {
            this.onSpreadEnd(this.selectedMesh);
          }
        },
      }));
  }

  /**
   * Returns the currently selected Mesh
   */
  getSelectedMesh() {
    return this.selectedMesh;
  }

  setSelectedMesh(mesh : THREE.Mesh) {
    this.selectedMesh = mesh;
  }
  /**
    * Method returns the mesh hit by a raycast
    * Provided with a bool to check whether any mesh
    * was hit at all
  */
  updateSelectedMesh() {
    // Update picking ray with camera and position
    // Position (0,0) casts ray from centre of screen
    // This seems to work fine for now
    this.rayCaster.setFromCamera(
      { x : 0, y : 0 },
      this.camera,
    );

    // Get array of intersected objects
    const intersects = this.rayCaster.intersectObjects(this.scene.children);

    // Check if raycaster intersects with a mesh
    if (intersects[0] && intersects[0].object instanceof THREE.Mesh) {
      if (this.selectedMesh) {
        // Check if the mesh is not the one already selected
        if (intersects[0].object as THREE.Mesh !== this.selectedMesh) {
          // Deselect the mesh and update the selected mesh to the new one
          this.deselectMesh(this.selectedMesh);
          this.selectedMesh = intersects[0].object as THREE.Mesh;
          this.selectMesh(this.selectedMesh);
        }
      } else {
        this.selectedMesh = intersects[0].object as THREE.Mesh;
        this.selectMesh(this.selectedMesh);
      }
    } else { // No intersection with a mesh
      if (this.selectedMesh !== undefined) {
        this.deselectMesh(this.selectedMesh);
        this.selectedMesh = undefined;
      }
    }
  }

  startMeshMove(movingMesh : THREE.Mesh) {
    /*if (this.selectedMesh == movingMesh) {
      this.isMoving = true;
    }*/
    this.isMoving = true;
    this.movingMesh = movingMesh;
  }

  meshMove(delta: number) {
    if (this.isMoving && this.movingMesh) {
      // Make selected mesh translucent
      (this.movingMesh.material as THREE.MeshPhongMaterial).opacity = 0.7;

      // Set arbitrary scale for now
      const scale = 2;
      const dir = this.camera.getWorldDirection().multiplyScalar(scale);
      this.movingMesh.position.set(dir.x, dir.y, dir.z);
    }
  }

  endMeshMove (movingMesh : THREE.Mesh) {
    if (this.movingMesh) {
      // Set the selected mesh's opacity back to 1.0
      (this.movingMesh.material as THREE.MeshPhongMaterial).opacity = 1.0;

      // Set the moving flag to false
      this.isMoving = false;
      this.movingMesh = undefined;

      // Now we project this mesh into the world
      this.startProjection();
    }
  }

  startProjection() {
    const moveScale = 1/20;
    // Get the direction of the camera and scale it by scalar factor
    this.projectionDirection = this.camera.getWorldDirection().multiplyScalar(moveScale);

    this.isProjecting = true;
    this.projectingMesh = this.selectedMesh;
  }

  /**
   * Project mesh along camera vector
   */
  projectMesh(delta: number) {
    if (this.isProjecting && this.projectingMesh) {
      if (this.projectingMesh.position.length() < 4) {
        // Add the direction vector onto the selected mesh's position
        this.projectingMesh.position.add(this.projectionDirection);
      } else {
        // Call the callback function 'on complete'
        this.endProjection();
      }
    }
  }

  endProjection() {
    this.isProjecting = false;
    this.projectingMesh = undefined;
  }

  update(delta: number) {
    this.updateSelectedMesh();
    this.projectMesh(delta);
    this.meshMove(delta);
  }
}
