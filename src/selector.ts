import * as THREE from 'three';

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
  onMeshProjectionComplete : () => void;

  // Public methods

  /**
   * Constructor takes a camera to set up raytracer
   * and scene from which meshes can be selected
   */
  constructor(camera : THREE.Camera,
                scene : THREE.Scene,
                onMeshSelected : (mesh : THREE.Mesh) => void,
                onMeshDeselected : (mesh : THREE.Mesh) => void,
                onMeshProjectionComplete : () => void) {
    this.camera = camera;
    this.scene = scene;
    this.rayCaster = new THREE.Raycaster();

    this.selectMesh = onMeshSelected;
    this.deselectMesh = onMeshDeselected;
    this.onMeshProjectionComplete = onMeshProjectionComplete;
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

  /**
   * Project mesh along camera vector
   */
  projectMesh() {
    if (this.selectedMesh) {
      // Temporary move scale variable - tie it more to world representation?
      const moveScale = 1/20;

      // Get the direction of the camera and scale it by scalar factor
      const dir = this.camera.getWorldDirection().multiplyScalar(moveScale);

      if (this.selectedMesh.position.length() < 4) {
        // Add the direction vector onto the selected mesh's position
        this.selectedMesh.position.add(dir);
      } else {
        // Call the callback function 'on complete'
        this.onMeshProjectionComplete();
      }
    }
  }
}
