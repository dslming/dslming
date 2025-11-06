
import { ParagraphHandler } from "./ParagraphHandler.js";
import Slider from './Slider.js'
const articles = [
  {
    title: "firefly",
  },
  {
    title: "crow",
  }, {
    title: "study",
  }
]

articles.forEach(item => {
  item.englishSegment = `/ted/${item.title}/english.json`;
  item.chineseSegment = `/ted/${item.title}/chinese.json`;
  item.worlds = `/ted/${item.title}/world.txt`;
  item.detail = `/ted/${item.title}/detail.json`;
  item.contentUrl = `https://cdn.jsdelivr.net/gh/dslming/assets/audio/${item.title}.mp3`
})

let slider;
let paragraphHandler;

function updateParagraphProgress(paragraphProgress, progress) {
  const percentage = Math.floor(progress * 100);
  paragraphProgress.style.width = `${percentage}%`;
}

// 播放单词发音
window.handleWorldClick = function (word, index) {
  paragraphHandler.playWorld(word, index);
}

// 编辑输入时，判断是否输入正确
window.handleInput = function (input, expected, index) {
  document.querySelector(".world-relate").textContent = ""
  if (input.value.toLowerCase() === expected.toLowerCase()) {
    paragraphHandler.exitEdit();
  }
}

// truncate
window.onload = async function () {
  // 句子容器
  const englishSentenceElement = document.querySelector(".worlds")
  const chineseSentenceElement = document.querySelector(".sentence-chinese")
  const nextBtn = document.querySelector(".arrow-btn-right")
  const previousBtn = document.querySelector(".arrow-btn-left")
  const playVidowBtn = document.querySelector(".play-vidow-btn")
  const copyBtn = document.querySelector(".copy");
  const editBtn = document.querySelector(".edit");
  // 侧边菜单
  slider = new Slider({
    articles,
    clickCallback: (item) => {
      window.location.href = `${window.location.origin}/index.html?${item.title}`
    }
  });

  // 拷贝当前句子
  copyBtn.addEventListener("click", () => {
    const text = paragraphHandler.getCurrentSentence();
    navigator.clipboard.writeText(text.content).then(() => {
      console.log("Text copied to clipboard");
    }).catch(err => {
      console.error("Error copying text: ", err);
    });
  })

  // 进入单词编辑
  editBtn.addEventListener("click", () => {
    paragraphHandler.enterEdit();
  })

  document.querySelector(".world-relate").addEventListener("click", () => {
    document.querySelector(".world-relate").innerHTML = "";
  })

  const searchInfo = window.location.search.split('&')
  const articleTitle = searchInfo[0].slice(1);
  const sentenceIndex = searchInfo[1];

  const article = articles.find(article => article.title === articleTitle);
  if (!article) {
    console.error("error", articleTitle);
    return;
  }

  let baseURL = window.location.origin;
  if (baseURL.includes("dslming.github.io")) {
    baseURL += "/dslming/";
  }
  const detail = await fetch(baseURL + article.detail).then(response => response.json())
  const worlds = await fetch(baseURL + article.worlds).then(response => response.text())
  const englishSegment = await fetch(baseURL + article.englishSegment).then(response => response.json())
  const chineseSegment = await fetch(baseURL + article.chineseSegment).then(response => response.json())

  // 段落信息容器
  const paragraphInfoElement = document.querySelector(".truncate")
  const paragraphProgress = document.querySelector(".paragraph-progress");

  paragraphHandler = new ParagraphHandler({
    title: article.title,
    englishSegment: englishSegment,
    chineseSegment: chineseSegment,
    worlds: worlds,
    worldsDetail: detail,
    englishSentenceElement: englishSentenceElement,
    chineseSentenceElement: chineseSentenceElement,
    paragraphInfoElement: paragraphInfoElement,
    contentUrl: article.contentUrl
  });
  window.paragraphHandler = paragraphHandler;
  if(articleTitle && sentenceIndex) {
    paragraphHandler.setCurrentSentenceIndex(parseInt(sentenceIndex));
  }
  paragraphHandler.setEditElement(editBtn);
  updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());


  nextBtn.onclick = function () {
    paragraphHandler.playNext();
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
    paragraphHandler.exitEdit();
    paragraphHandler.exitMean();
    paragraphHandler.exitRelate();
  }

  previousBtn.onclick = function () {
    paragraphHandler.playPrevious();
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
    paragraphHandler.exitMean();
    paragraphHandler.exitRelate();
    paragraphHandler.exitEdit();
  }

  setTimeout(async () => {
    await paragraphHandler.audioTextHandler.load();
    playVidowBtn.classList.add("play-btn-canplay");
  }, 0);

  playVidowBtn.onclick = function () {
    paragraphHandler.playText();
  }
}
