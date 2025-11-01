import { makeYoudaoPronounceUrl } from "./audioTool.js";

let audioPlayer = null;

function playWorldAudio(audioUrl) {
  return new Promise((resolve, reject) => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0; // 可选：从头开始
    }

    audioPlayer = new Audio(audioUrl);
    audioPlayer.play().catch(err => {
      console.warn('播放失败:', err.message);
    })
    audioPlayer.onended = function () {
      resolve();
    };
  })
}

export class WorldAudioHandler {
  constructor() {
  }

  playLocal(text) {
    const utterance = new SpeechSynthesisUtterance(text);

    // 选择男声（不同浏览器支持不同）
    const voices = speechSynthesis.getVoices();
    const maleVoice = voices.find(v =>
      v.name.includes('Guy') ||
      v.name.includes('Male') ||
      v.lang.startsWith('en-US')
    );

    const femaleVoice = voices.find(v =>
      v.name.includes('Female') ||
      v.name.includes('Woman') ||
      v.name.includes('Samantha') ||  // macOS/iOS 常见女声
      v.name.includes('Google UK English Female') ||  // Chrome 安卓常见
      v.name.includes('Microsoft') && v.name.includes('Online') && v.name.includes('Female') ||
      v.lang.startsWith('en') && !v.name.includes('Male')  // 兜底：英语且不含 Male 的通常是女声
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
  }

  async playWorld(word) {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0; // 可选：从头开始
    }

    const audioUrl = `http://dict.youdao.com/dictvoice?type=2&audio=` + word;
    await playWorldAudio(audioUrl);
    await playWorldAudio(audioUrl);
    await playWorldAudio(audioUrl);
  }

  // playTextWithYouDao(text) {
  //   const url = makeYoudaoPronounceUrl(text);
  //   const audioPlayer = new Audio(url);
  //   audioPlayer.play().catch(err => {
  //     console.warn('播放失败:', err.message);
  //   });
  // }

  // play(text) {
  //   const a = new Audio("https://cdn.jsdelivr.net/gh/dslming/assets/audio/firefly.mp3")
  //   a.play().catch(err => {
  //     console.warn('播放失败:', err.message);
  //   });
  // }
}
