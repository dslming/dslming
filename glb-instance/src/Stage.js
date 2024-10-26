import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function focus(target, stage) {
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const delta = new THREE.Vector3();
  const sphere = new THREE.Sphere();

  let distance;

  box.setFromObject(target);

  if (box.isEmpty() === false) {
    box.getCenter(center);
    distance = box.getBoundingSphere(sphere).radius;
  } else {
    // Focusing on an Group, AmbientLight, etc
    center.setFromMatrixPosition(target.matrixWorld);
    distance = 0.1;
  }

  delta.set(0, 0, 1);
  delta.applyQuaternion(stage._camera.quaternion);
  delta.multiplyScalar(distance * 4);
  stage._camera.lookAt(center);
  stage._camera.position.copy(center).add(delta);
  stage._controls.target.copy(center);
  stage._controls.update();
}

function traverseMaterials(object, callback) {
	object.traverse((node) => {
		if (!node.geometry) return;
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		materials.forEach(callback);
	});
}

export class Stage {
  constructor() {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
    this._camera.position.set(- 100, 100.5, 200);
    this._camera.lookAt(0, 0.5, 0);
    // this._camera.up.set(0, 0, 1);
    this._scene.background = new THREE.Color(0x252525);

    const hemiLight = new THREE.HemisphereLight();
    this._scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    this._scene.add(dirLight);

    const domElement = document.querySelector(".gltf-viewer");

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(domElement.clientWidth, domElement.clientHeight);
    this._renderer.setAnimationLoop(this.animate.bind(this));
    this._renderer.shadowMap.enabled = false;

    domElement.appendChild(this._renderer.domElement);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);

    const axis = new THREE.AxesHelper(10000);
    this._scene.add(axis);

    const onWindowResize = () => {
      this._camera.aspect = domElement.clientWidth / domElement.clientHeight;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(domElement.clientWidth, domElement.clientHeight);
    };
    window.addEventListener('resize', onWindowResize, false);
  }

  get scene() {
    return this._scene;
  }

  add(object) {
    this._scene.add(object);
    focus(object, this);
  }

  animate() {
    this._renderer.render(this._scene, this._camera);
    this._controls.update();
  }
}
