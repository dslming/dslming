import { loadAudio } from "./tool/loadAudio.js";

export class TextAudioHandler {
  constructor(url) {
    this.audio = null;
    this.url = url;
    this.isReady = false;
    this.isPlaying = false;
  }

  async load() {
    this.objectUrl = await loadAudio(this.url);
    return Promise.resolve();
  }

  async play(startTime = 0, endTime = null) {
    if(this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.audio = new Audio(this.objectUrl);

    // 重置状态
    this.isPlaying = false;
    this.audio.currentTime = startTime;

    // 清除之前的监听器（避免重复绑定）
    this.audio.ontimeupdate = null;

    return new Promise((resolve, reject) => {
      let hasPlayed = false;

      const onPlay = () => {
        if (!hasPlayed) {
          hasPlayed = true;
          this.isPlaying = true;
        }
      };

      const onTimeUpdate = () => {
        const current = this.audio.currentTime;

        // 播放开始后触发一次
        if (!hasPlayed && current >= startTime) {
          onPlay();
        }

        // 精确结束控制
        if (endTime !== null && current >= endTime) {
          this.pause();
          this.audio.ontimeupdate = null; // 清理
          resolve(); // 播放片段结束
        }
      };

      const onError = (e) => {
        this.audio.ontimeupdate = null;
        reject(e);
      };

      const onEnded = () => {
        this.audio.ontimeupdate = null;
        if (this.isPlaying) {
          this.isPlaying = false;
          resolve();
        }
      };

      // 绑定事件
      this.audio.addEventListener('play', onPlay, { once: true });
      this.audio.addEventListener('timeupdate', onTimeUpdate);
      this.audio.addEventListener('error', onError, { once: true });
      this.audio.addEventListener('ended', onEnded, { once: true });

      // 开始播放
      this.audio.play().catch((err) => {
        this.audio.ontimeupdate = null;
        reject(err);
      });
    });
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }
}
