
import { ArticlehHandler } from "./ArticlehHandler.js";

const articles = [
  {
    title: "firefly",
  },
  {
    title: "crow",
  }
]

articles.forEach(item => {
  item.content = `/ted/${item.title}/content.txt`;
  item.segment = `/ted/${item.title}/segment.json`;
  item.worlds = `/ted/${item.title}/world.txt`;
  item.detail = `/ted/${item.title}/detail.json`;
  item.contentUrl = `https://cdn.jsdelivr.net/gh/dslming/assets/audio/${item.title}.mp3`
})


let articleHandler;
let paragraphHandler;

function updateParagraphProgress(paragraphProgress, progress) {
  const percentage = Math.floor(progress * 100);
  paragraphProgress.style.width = `${percentage}%`;
}

window.handleWorldClick = function (word, index) {
  paragraphHandler.playWorld(word, index);
}

// 编辑输入时，判断是否输入正确
window.handleInput = function (input, expected, index) {
  document.querySelector(".world-relate").textContent = ""
  if (input.value.toLowerCase() === expected) {
    paragraphHandler.exitEdit();
  }
}

// truncate
window.onload = async function () {
  // 句子容器
  const sentenceElement = document.querySelector(".worlds")
  const nextBtn = document.querySelector(".arrow-btn-right")
  const previousBtn = document.querySelector(".arrow-btn-left")
  const playVidowBtn = document.querySelector(".play-vidow-btn")
  const copyBtn = document.querySelector(".copy");
  const editBtn = document.querySelector(".edit");

  // 拷贝当前句子
  copyBtn.addEventListener("click", () => {
    const text = paragraphHandler.getCurrentSentence();
    navigator.clipboard.writeText(text).then(() => {
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

  const articleTitle = window.location.search.slice(1)
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
  const content = await fetch(baseURL + article.content).then(response => response.text())
  const worlds = await fetch(baseURL + article.worlds).then(response => response.text())
  const segment = await fetch(baseURL + article.segment).then(response => response.json())

  // 段落信息容器
  const paragraphInfoElement = document.querySelector(".truncate")
  const paragraphProgress = document.querySelector(".paragraph-progress");

  articleHandler = new ArticlehHandler({
    title: article.title,
    segment: segment,
    content: content,
    worlds: worlds,
    worldsDetail: detail,
    sentenceElement: sentenceElement,
    paragraphInfoElement: paragraphInfoElement,
    contentUrl: article.contentUrl
  });
  window.articleHandler = articleHandler;
  paragraphHandler = articleHandler.paragraphHandler;
  paragraphHandler.setEditElement(editBtn);
  updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());

  nextBtn.onclick = function () {
    const success = paragraphHandler.playNext();
    if (!success) {
      articleHandler.nextParagraph();
    }
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
    paragraphHandler.exitEdit();
  }

  previousBtn.onclick = function () {
    const success = paragraphHandler.playPrevious();
    if (!success) {
      articleHandler.precisionParagraph();
    }
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
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
