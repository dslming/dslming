import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { saveArrayBuffer } from './Util.js';

function getAnimations(scene) {
  const animations = [];
  scene.traverse(function (object) {
    animations.push(...object.animations);
  });
  return animations;
}

export class ExportFile {
  constructor() { }

  export(scene) {
    return new Promise((resolve, reject) => {
      const animations = getAnimations(scene);

      const optimizedAnimations = [];
      for (const animation of animations) {
        optimizedAnimations.push(animation.clone().optimize());
      }
      const fileName = 'scene.glb';
      const exporter = new GLTFExporter();

      exporter.parse(scene, function (result) {
        saveArrayBuffer(result, fileName);
        resolve(fileName);
      }, undefined, { trs: false, binary: true, animations: optimizedAnimations });
    });
  }
}
