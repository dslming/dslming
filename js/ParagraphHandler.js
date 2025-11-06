import { TextAudioHandler } from "./TextAudioHandler.js";
import { WorldAudioHandler } from "./WorldAudioHandler.js";

function getURL() {
  const urlInfo = new URL(window.location.href);
  let url = `http://${urlInfo.hostname}:3000`;
  if (!url.includes("127")) {
    url = "https://overly-neat-possum.ngrok-free.app"
  }
  return url;
}

// 剪映视频时间格式转换为秒数
// 字符串 "0.12.0"：
// 第一个数字：0 → 分钟
// 第二个数字：12 → 秒
// 第三个数字：0 → 帧（基于 30 帧/秒）
function timeToSeconds(str) {
  const [minutes, seconds, frames] = str.split('.').map(Number);
  const totalSeconds = minutes * 60 + seconds + frames / 30;
  return totalSeconds;
}

/**
 * 解析 VTT 时间戳字符串 → 秒（浮点数）
 * @param {string} timestamp - 形如 "00:00:07.211" 或 "01:23:45.678"
 * @returns {number} 总秒数（带毫秒），如 7.211
 */
function parseVttTimestampToSeconds(timestamp) {
  // 严格匹配 HH:MM:SS.mmm
  const match = timestamp.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid VTT timestamp format: ${timestamp}`);
  }

  const [_, hh, mm, ss, ms] = match;
  const hours = parseInt(hh, 10);
  const minutes = parseInt(mm, 10);
  const seconds = parseInt(ss, 10);
  const millis = parseInt(ms, 10);

  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}


function extractWords(sentence) {
  const words = sentence.match(/\b\w+(?:['’]\w+)?\b/g)
    .map(word => word.replace(/[.,"?!]/g, ''))  // 去除标点
    .filter(word => word.length > 0);
  return words
}

// 段落处理类, 处理单个段落里的句子
export class ParagraphHandler {
  #englishSentenceElement;
  #chineseSentenceElement;
  #currentSentenceIndex;
  #englishSentences;
  #chineseSentences;
  #worlds;
  #worldsDetail;

  constructor(options) {
    this.#englishSentences = options.englishSegment.line;
    this.#chineseSentences = options.chineseSegment.line;
    this.englishSegment = options.englishSegment;
    this.chineseSegment = options.chineseSegment;
    this.#worldsDetail = options.worldsDetail;
    this.#worlds = options.worlds.match(/[a-zA-Z]+/g) || [];
    this.#englishSentenceElement = options.englishSentenceElement;
    this.#chineseSentenceElement = options.chineseSentenceElement;
    this.#currentSentenceIndex = 0;
    this.audioWorldHandler = new WorldAudioHandler();
    this.audioTextHandler = new TextAudioHandler(options.contentUrl);
    this.#play();
    this.#updateParagraphInfoElement();
  }

  setCurrentSentenceIndex(index) {
    this.#currentSentenceIndex = index - 1;
    this.#play();
    this.#updateParagraphInfoElement();
  }

  getProgress() {
    return (this.#currentSentenceIndex + 1) / this.#englishSentences.length;
  }


  #createWordElements(words) {
    let str = '';
    // https://api.julebu.co/api/audio?text=I+don%27t+want+to+be+here+all+the+day&voice=BV503_streaming&version=v1&source=advanced

    words.forEach((wordText, index) => {
      if (this.#worlds.includes(wordText)) {
        str += `<span class="highlight world-index-${index}"
                onclick="handleWorldClick('${wordText}', ${index})">${wordText}</span>`;
      } else {
        str += `<span class="">${wordText}</span>`;
      }

    })
    str += '.'
    this.#englishSentenceElement.innerHTML = str;
  }

  #updateParagraphInfoElement() {
    const paragraphInfoElement = document.querySelector(".truncate");
    paragraphInfoElement.textContent = `${this.#currentSentenceIndex + 1} / ${this.#englishSentences.length}`;

    const searchInfo = window.location.search.split('&')
    const articleTitle = searchInfo[0].slice(1);
    // window.location.search = `?${articleTitle}&${this.#currentSentenceIndex + 1}`;
  }

  playNext() {
    if (this.#currentSentenceIndex < this.#englishSentences.length - 1) {
      this.#currentSentenceIndex++;
      this.#play();
      this.#updateParagraphInfoElement();
      return true;
    } else {
      console.log("Already at the last sentence.");
      return false;
    }
  }

  playPrevious() {
    if (this.#currentSentenceIndex > 0) {
      this.#currentSentenceIndex--;
      this.#play();
      this.#updateParagraphInfoElement();
      return true;
    } else {
      console.log("Already at the first sentence.");
      return false;
    }
  }

  // 进入编辑状态
  enterEdit() {
    if (!this.spellWorldInfo) {
      return;
    }

    document.querySelector(".world-relate").textContent = ""
    const worldInfo = this.#worldsDetail[this.spellWorldInfo.word];
    document.querySelector(".world-phonetic").textContent = `/${worldInfo.phonetic}/`;

    const dom = document.querySelector(`.world-index-${this.spellWorldInfo.index}`);
    dom.classList.remove("highlight");
    if (this.spellWorldInfo.state == "editing") {
      dom.removeChild(dom.firstChild);
      dom.textContent = this.spellWorldInfo.word;
      this.spellWorldInfo.state = "none"
    } else {
      // 进入编辑状态：创建输入框
      const str = '_'.repeat(this.spellWorldInfo.word.length);

      const inputEle = document.createElement('input');
      inputEle.className = 'fill-input';
      inputEle.type = 'text';
      inputEle.id = 'word-10'; // 注意：id 重复可能有问题，建议动态生成
      // inputEle.placeholder = str;
      inputEle.value = ''; // 初始值为空

      // 绑定事件（推荐使用 addEventListener）
      inputEle.addEventListener('input', (e) => {
        handleInput(e.target, this.spellWorldInfo.word, 10);
      });

      // 清空并插入输入框
      dom.innerHTML = `<span class="edit-line">${this.spellWorldInfo.word}</span>`;
      dom.appendChild(inputEle);

      // 关键：自动聚焦并选中
      inputEle.focus();
      // 可选：将光标放到末尾
      inputEle.setSelectionRange(str.length, str.length);

      this.spellWorldInfo.state = "editing";
    }

  }


  setEditElement(editBtn) {
    this.editBtn = editBtn;
  }

  enableEditBtn() {
    this.editBtn.classList.remove("disable");
    this.editBtn.classList.add("enable");
  }

  disableEditBtn() {
    this.editBtn.classList.remove("enable");
    this.editBtn.classList.add("disable");
  }

  exitEdit() {
    this.disableEditBtn();
    if (!this.spellWorldInfo) return;

    const dom = document.querySelector(`.world-index-${this.spellWorldInfo.index}`);
    if (!dom) return;
    dom.classList.add("highlight");
    dom.removeChild(dom.firstChild);
    dom.textContent = this.spellWorldInfo.word;
    this.spellWorldInfo.state = "none"
    this.spellWorldInfo = null;
  }

  exitPhonetic() {
    document.querySelector(".world-phonetic").textContent = "";
  }

  exitMean() {
    document.querySelector(".world-mean").textContent = "";
  }

  exitRelate() {
    document.querySelector(".world-relate").textContent = "";
  }

  // 播放单词发音
  async playWorld(word, index) {
    if (this.spellWorldInfo && this.spellWorldInfo.state == "editing") {
      return;
    }

    this.enableEditBtn();
    this.spellWorldInfo = {
      word: word,
      index: index,
    }
    let ret = word;
    const worldInfo = this.#worldsDetail[word.toLowerCase()];
    if (worldInfo) {
      ret = worldInfo.world;
    }
    this.audioWorldHandler.playWorld(ret);

    if (worldInfo) {
      const worlTypeMap = {
        'n.': 'world-type-n',
        'v.': 'world-type-v',
        'vi.': 'world-type-v',
        'vt.': 'world-type-v',
        'adj.': 'world-type-adj',
        'adv.': 'world-type-adv',
        'pron.': 'world-type-pron',
        'prep.': 'world-type-prep',
        'conj.': 'world-type-conj',
      }


      if (worldInfo.world.toLowerCase() !== word.toLowerCase()) {
        document.querySelector(".world-phonetic").textContent = `${worldInfo.world} /${worldInfo.phonetic}/`;
      } else {
        document.querySelector(".world-phonetic").textContent = `/${worldInfo.phonetic}/`;
      }

      let strMeans = ``;
      worldInfo.meaning.forEach(item => {
        strMeans += `
          <div class="chinese-item">
            <span class="${item.pos}">${item.pos}</span> ${item.meaning}
          </div>`;
      })
      document.querySelector(".world-mean").innerHTML = strMeans;


      let str = ``;
      if (worldInfo.relate) {
        worldInfo.relate.forEach(info => {
          str += `<div class="relate-item">
            <span>${info.world}</span> <span class="${worlTypeMap[info.pos]}">${info.pos}</span> ${info.meaning}
            </div>
          `
        })
      }
      document.querySelector(".world-relate").innerHTML = str;
    }

  }

  playText() {
    const version = this.englishSegment.version;
    const currentText = this.getCurrentSentence();

    if (version === "1.1.0") {
      this.audioTextHandler.play(
        parseVttTimestampToSeconds(currentText.begin),
        parseVttTimestampToSeconds(currentText.end)
      );
    } else {
      this.audioTextHandler.play(
        timeToSeconds(currentText.begin),
        timeToSeconds(currentText.end)
      );
    }
  }

  #createChineseSentence() {
    this.#chineseSentenceElement.innerHTML = ''; // Clear previous content
    const sentence = this.#chineseSentences[this.#currentSentenceIndex];
    this.#chineseSentenceElement.textContent = sentence.content;
  }

  #play() {
    this.#englishSentenceElement.innerHTML = ''; // Clear previous content
    const sentence = this.#englishSentences[this.#currentSentenceIndex];
    const words = extractWords(sentence.content);
    this.#createWordElements(words);
    this.#createChineseSentence();
  }

  getCurrentSentence() {
    return this.#englishSentences[this.#currentSentenceIndex];
  }
}
