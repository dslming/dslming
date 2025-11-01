
import { ArticlehHandler } from "./ArticlehHandler.js";

const articles = [
  {
    title: "firefly",
    content: "/ted/firefly/content.txt",
    worlds: "/ted/firefly/world.txt",
    detail: "/ted/firefly/detail.json",
  },
  {
    title: "crow",
    content: "/ted/crow/content.txt",
    worlds: "/ted/crow/world.txt",
    detail: "/ted/crow/detail.json",
  }
]
let articleHandler;
let paragraphHandler;

function updateParagraphProgress(paragraphProgress, progress) {
  const percentage = Math.floor(progress * 100);
  paragraphProgress.style.width = `${percentage}%`;
}

window.handleWorldClick = function (word) {
  paragraphHandler.playWorld(word);
}

// truncate
window.onload = async function () {
  // 句子容器
  const sentenceElement = document.querySelector(".worlds")
  const nextBtn = document.querySelector(".arrow-btn-right")
  const previousBtn = document.querySelector(".arrow-btn-left")
  const playVidowBtn = document.querySelector(".play-vidow-btn")
  document.querySelector(".world-relate").addEventListener("click", () => {
    document.querySelector(".world-relate").innerHTML = "";
  })

  const articleTitle = window.location.search.slice(1)
  const article = articles.find(article => article.title === articleTitle);
  if(!article) {
    return;
  }

  let baseURL = window.location.origin;
  if(baseURL.indexOf("localhost") !== -1) {
    baseURL += "/dslming/";
  }
  const detail = await fetch(baseURL + article.detail).then(response => response.json())
  const content = await fetch(baseURL + article.content).then(response => response.text())
  const worlds = await fetch(baseURL + article.worlds).then(response => response.text())

  // 段落信息容器
  const paragraphInfoElement = document.querySelector(".truncate")
  const paragraphProgress = document.querySelector(".paragraph-progress");

  articleHandler = new ArticlehHandler({
    title: "firefly",
    content: content,
    worlds: worlds,
    worldsDetail: detail,
    sentenceElement: sentenceElement,
    paragraphInfoElement: paragraphInfoElement
  });
  window.articleHandler = articleHandler;
  paragraphHandler = articleHandler.paragraphHandler;
  updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());

  nextBtn.onclick = function () {
    const success = paragraphHandler.playNext();
    if (!success) {
      articleHandler.nextParagraph();
    }
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
  }

  previousBtn.onclick = function () {
    const success = paragraphHandler.playPrevious();
    if (!success) {
      articleHandler.precisionParagraph();
    }
    updateParagraphProgress(paragraphProgress, paragraphHandler.getProgress());
  }

  playVidowBtn.onclick = function () {
    paragraphHandler.playAudio();
  }
}
