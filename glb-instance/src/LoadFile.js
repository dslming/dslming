import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Global } from './Global.js';
import { formatNumber } from './Util.js';

export class LoadFile {
  constructor() {
  }

  loadFile() {
    return new Promise((resolve, reject) => {
      const file = Global.get('file');
      const filename = file.name;

      const reader = new FileReader();

      reader.addEventListener('progress', function (event) {
        const size = '(' + formatNumber(Math.floor(event.total / 1000)) + ' KB)';
        const progress = Math.floor((event.loaded / event.total) * 100) + '%';
        console.log('Loading', filename, size, progress);
      });

      reader.addEventListener('error', event => {
        console.error('Error', event);
        reject(event);
      });

      reader.addEventListener('load', function (event) {
        const contents = event.target.result;
        const loader = new GLTFLoader();

        loader.parse(contents, '', result => {
          const sceneGltf = result.scene;
          sceneGltf.name = filename;

          sceneGltf.animations.push(...result.animations);

          resolve(sceneGltf);
        });
      }, false);

      reader.readAsArrayBuffer(file);
    })
  }
}
