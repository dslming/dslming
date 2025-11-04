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

// 字符串 "0.12.0"：
// 第一个数字：0 → 分钟
// 第二个数字：12 → 秒
// 第三个数字：0 → 帧（基于 30 帧/秒）
function timeToSeconds(str) {
  const [minutes, seconds, frames] = str.split('.').map(Number);
  const totalSeconds = minutes * 60 + seconds + frames / 30;
  return totalSeconds;
}


function extractSentences(paragraph) {
  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)  // Split on whitespace following . ! or ?
    .map(s => s.trim())      // Trim extra whitespace
    .filter(s => s.length > 0); // Remove empty strings
  return sentences
}

function extractWords(sentence) {
  const words = sentence.match(/\b\w+(?:['’]\w+)?\b/g)
    .map(word => word.replace(/[.,"?!]/g, ''))  // 去除标点
    .filter(word => word.length > 0);
  return words
}

// 段落处理类, 处理单个段落里的句子
export class ParagraphHandler {
  #parent;
  #paragraph;
  #currentSentenceIndex;
  #sentences;
  #worlds;
  #worldsDetail;

  constructor(options) {
    this.segment = options.segment;
    this.#worldsDetail = options.worldsDetail;
    this.#worlds = options.worlds.match(/[a-zA-Z]+/g) || [];
    this.#parent = options.parent;
    this.#paragraph = options.paragraph;
    this.#currentSentenceIndex = 0;
    this.paragraphIndex = 0;
    this.#sentences = extractSentences(this.#paragraph);
    this.audioWorldHandler = new WorldAudioHandler();
    this.audioTextHandler = new TextAudioHandler(options.contentUrl);
    this.#play();
  }

  getProgress() {
    return (this.#currentSentenceIndex + 1) / this.#sentences.length;
  }

  setParagraph(paragraph, paragraphIndex) {
    this.#paragraph = paragraph;
    this.#sentences = extractSentences(this.#paragraph);
    this.#currentSentenceIndex = 0;
    this.paragraphIndex = paragraphIndex;
    this.#play();
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
    this.#parent.innerHTML = str;
  }

  playNext() {
    if (this.#currentSentenceIndex < this.#sentences.length - 1) {
      this.#currentSentenceIndex++;
      this.#play();
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
    if(!dom) return;
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
    const worldInfo = this.#worldsDetail[word];
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


      if (worldInfo.world !== word) {
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
    const lines = this.segment.line;
    const currentText = this.getCurrentSentence();
    lines.forEach(line => {
      if (line.content.includes(currentText)) {
        this.audioTextHandler.play(
          timeToSeconds(line.begin),
          timeToSeconds(line.end)
        );
      }
    })
  }

  #play() {
    this.#parent.innerHTML = ''; // Clear previous content
    const sentence = this.#sentences[this.#currentSentenceIndex];
    const words = extractWords(sentence);
    this.#createWordElements(words);
  }

  getCurrentSentence() {
    return this.#sentences[this.#currentSentenceIndex];
  }
}
