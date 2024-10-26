import * as THREE from 'three';
import { LoadFile } from './LoadFile.js';
import { ExportFile } from './ExportFile.js';

import { Stage } from './Stage.js';
import { UI } from './UI.js'
import { Global } from './Global.js';


class Main {
  constructor() {
    this.ui = new UI();

    this.ui.addEventListener('beginViewer', async () => {
      this.stage = new Stage();
      this.loader = new LoadFile();
      this.exporter = new ExportFile();

      this.loader.loadFile().then(scene => {
        this.stage.add(scene);
      }).catch((error) => {
        console.error(error);
      })
    });

    this.ui.addEventListener('beginInstance', () => {
      // 弱化参考 glb
      this.stage.scene.traverse(node => {
        if (node.isMesh) {
          node.material.wireframe = true;
        }
      })

      this.loader.loadFile().then(scene => {
        this.exportGLB(scene);
      }).catch((error) => {
        console.error(error);
      })
    })
  }

  async exportGLB(sceneGltf) {
    const coordinatesInput = Global.get('coordinates');

    const parts = coordinatesInput.split(',').filter(item => item.trim() !== '');
    const coordinates = parts.map(coord => { return +coord; });

    const data = coordinates;

    if (data.length % 3 !== 0) {
      console.error('coordinates length is not multiple of 3.');
      return;
    }

    const instanceCounter = data.length / 3;

    sceneGltf.traverse(function (object) {
      if (object.isMesh) {
        const mesh = new THREE.InstancedMesh(object.geometry, object.material, instanceCounter);

        // 缩放转移
        const worldScale = object.getWorldScale(new THREE.Vector3());
        mesh.scale.copy(new THREE.Vector3(1, 1, 1).divide(worldScale));
        const matrix = new THREE.Matrix4();

        for (let i = 0; i < instanceCounter; i++) {
          const position = new THREE.Vector3(
            data[i * 3 + 0],
            data[i * 3 + 1],
            data[i * 3 + 2],
          );

          const scale = new THREE.Vector3(1, 1, 1);
          scale.multiply(worldScale);

          matrix.compose(
            position,
            new THREE.Quaternion(),
            scale
          );
          mesh.setMatrixAt(i, matrix);
        }

        mesh.name = object.name;
        const parent = object.parent;
        object.visible = false;
        parent.add(mesh);
      }

    });
    this.stage.add(sceneGltf)

    this.exporter.export(sceneGltf).then((fileName)=>{
      console.log('export glb file succ.');

      this.ui.setState({
        type: "exported",
        state: "200",
        msg: `Exported glb file success: ${fileName} ✅`
      })
    })
  }
}

new Main();
