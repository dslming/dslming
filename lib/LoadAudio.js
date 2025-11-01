// 加载从 Google Drive 上的音频文件
export class LoadAudio {
  constructor(fileId) {
    this.fileId = fileId;
    this.audioUrl = this.buildProxyUrl(fileId);
  }

  buildProxyUrl(fileId) {
    const gdUrl = `https://drive.google.com/uc?export=open&id=${fileId}`;
    return 'https://corsproxy.io/?' + encodeURIComponent(gdUrl);
  }

  // const mp3Url = 'https://cdn.jsdelivr.net/gh/lianming/assets/How%20do%20fireflies%20create%20light%20%20-%20Emily%20A.%20Geest.mp3';

  async loadAudio() {
    try {
      const response = await fetch(this.audioUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();
      return url; // 返回 blob URL 用于 <audio>
    } catch (error) {
      console.error('Load audio failed:', error);
      throw error;
    }
  }
}

// // 使用
// const loader = new LoadAudio('1IL-lfii6cjpUsMWmbhns7g2_xSgFeNDx');
// loader.loadAudio().then(blobUrl => {
//   document.getElementById('audio').src = blobUrl;
// });
