import { AudioHandler } from "./AudioHandler.js";

function getURL() {
  const urlInfo = new URL(window.location.href);
  let url = `http://${urlInfo.hostname}:3000`;
  if (!url.includes("127")) {
    url = "https://overly-neat-possum.ngrok-free.app"
  }
  return url;
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
    this.#worldsDetail = options.worldsDetail;
    this.#worlds = options.worlds.match(/[a-zA-Z]+/g) || [];
    this.#parent = options.parent;
    this.#paragraph = options.paragraph;
    this.#currentSentenceIndex = 0;
    this.paragraphIndex = 0;
    this.#sentences = extractSentences(this.#paragraph);
    this.audioHandler = new AudioHandler();
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

    words.forEach(wordText => {
      if (this.#worlds.includes(wordText)) {
        str += `<span class="highlight" onclick="handleWorldClick('${wordText}')">${wordText}</span>`;
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

  playAudio() {
    const sentence = this.#sentences[this.#currentSentenceIndex];
    // this.audioHandler.play(this.paragraphIndex, this.#currentSentenceIndex);
    this.audioHandler.play(sentence);
  }

  async playWorld(word) {
    let ret = word;
    const worldInfo = this.#worldsDetail[word];
    if (worldInfo) {
      ret = worldInfo.world;
    }
    this.audioHandler.playWorld(ret);

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

      if(worldInfo.world !== word) {
        document.querySelector(".world-phonetic").textContent = `${worldInfo.world} /${worldInfo.phonetic}/`;
      } else {
        document.querySelector(".world-phonetic").textContent = `/${worldInfo.phonetic}/`;
      }
      document.querySelector(".world-mean").innerHTML = `
      <div class="chinese-item">
        <span class="${worlTypeMap[worldInfo.meaning.pos]}">${worldInfo.meaning.pos}</span> ${worldInfo.meaning.meaning}
      </div>`;

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
