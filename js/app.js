
import { ParagraphHandler } from "./ParagraphHandler.js";
import Slider from './Slider.js'
import { ref, createDOMRefs } from './DOMRef.js';

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

function updateParagraphProgress(progressBar, progress) {
  const percentage = Math.floor(progress * 100);
  progressBar.css('width', `${percentage}%`);
}

// 播放单词发音
window.handleWorldClick = function (word, index) {
  paragraphHandler.playWorld(word, index);
}

// 编辑输入时，判断是否输入正确
window.handleInput = function (input, expected, index) {
  ref(".world-relate").hide();
  if (input.value.toLowerCase() === expected.toLowerCase()) {
    paragraphHandler.exitEdit();
  }
}

// truncate
window.onload = async function () {
  // 初始化 DOM 引用
  const dom = createDOMRefs({
    englishSentence: ".worlds",
    chineseSentence: ".sentence-chinese",
    nextBtn: ".arrow-btn-right",
    previousBtn: ".arrow-btn-left",
    playBtn: ".play-vidow-btn",
    copyBtn: ".copy",
    editBtn: ".edit",
    truncate: ".truncate",
    progress: ".paragraph-progress"
  });

  // 侧边菜单
  slider = new Slider({
    articles,
    clickCallback: (item) => {
      let baseURL = window.location.origin;
      if (baseURL.includes("dslming.github.io")) {
        baseURL += "/dslming/";
      }
      window.location.href = `${baseURL}/index.html?${item.title}`
    }
  });

  // 拷贝当前句子
  dom.copyBtn.on("click", () => {
    const text = paragraphHandler.getCurrentSentence();
    navigator.clipboard.writeText(text.content).then(() => {
      console.log("Text copied to clipboard");
    }).catch(err => {
      console.error("Error copying text: ", err);
    });
  })

  // 进入单词编辑
  dom.editBtn.on("click", () => {
    paragraphHandler.enterEdit();
  })

  ref(".world-relate").on("click", () => {
    ref(".world-relate").clear().hide();
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

  paragraphHandler = new ParagraphHandler({
    title: article.title,
    englishSegment: englishSegment,
    chineseSegment: chineseSegment,
    worlds: worlds,
    worldsDetail: detail,
    englishSentenceElement: dom.englishSentence.el(),
    chineseSentenceElement: dom.chineseSentence.el(),
    paragraphInfoElement: dom.truncate.el(),
    contentUrl: article.contentUrl
  });
  window.paragraphHandler = paragraphHandler;
  if(articleTitle && sentenceIndex) {
    paragraphHandler.setCurrentSentenceIndex(parseInt(sentenceIndex));
  }
  paragraphHandler.setEditElement(dom.editBtn.el());
  updateParagraphProgress(dom.progress, paragraphHandler.getProgress());


  dom.nextBtn.on("click", function () {
    paragraphHandler.exitEdit();
    paragraphHandler.exitMean();
    paragraphHandler.exitRelate();

    paragraphHandler.playNext();
    updateParagraphProgress(dom.progress, paragraphHandler.getProgress());
  })

  dom.previousBtn.on("click", function () {
    paragraphHandler.exitMean();
    paragraphHandler.exitRelate();
    paragraphHandler.exitEdit();

    paragraphHandler.playPrevious();
    updateParagraphProgress(dom.progress, paragraphHandler.getProgress());
  })

  setTimeout(async () => {
    await paragraphHandler.audioTextHandler.load();
    dom.playBtn.addClass("play-btn-canplay");
  }, 0);

  dom.playBtn.on("click", function () {
    paragraphHandler.playText();
  })
}
