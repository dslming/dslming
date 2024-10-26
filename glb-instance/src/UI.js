import * as THREE from 'three';
import { Global } from './Global.js';

export class UI extends THREE.EventDispatcher {
  constructor() {
    super();

    this.coordinatesInput = document.getElementById('coordinates')
    this.start = document.querySelector(".dropzone");
    this.gltf = document.querySelector(".gltf-viewer");
    this.input = document.querySelector(".input-container");

    const fileInput = document.querySelector('input');

    fileInput.addEventListener('change', () => {
      Global.set('file', fileInput.files[0]);

      const filename = fileInput.files[0].name;
      this.setState({
        state: "200",
        msg: `Loaded file success: ${filename}`
      })

      this.start.classList.add("start-hide");
      this.gltf.style.display = "block";
      this.input.style.display = "block";

      this.dispatchEvent({
        type: 'beginViewer'
      });
    });

    document.querySelector(".instance-btn").addEventListener("click",()=>{
      Global.set('coordinates', this.coordinatesInput.value);

      this.dispatchEvent({
        type: 'beginInstance'
      });
    })
  }

  setState(info) {
    document.querySelector(".state").innerHTML = info.msg;

    if(info.type === "exported") {
      this.input.style.display = "none";
    }
  }
}
