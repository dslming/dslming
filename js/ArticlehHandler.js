import { ParagraphHandler } from './ParagraphHandler.js';

// 分割文章到段落
function handleTextToParagraphs(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paragraphs;
}

// 文章处理类
export class ArticlehHandler {
  constructor(options) {
    const {
      title,
      worlds,
      content,
      worldsDetail,
      sentenceElement,
      paragraphInfoElement
    } = options;
    // 文章所有分段
    this.paragraphs = handleTextToParagraphs(content);
    this.paragraphInfoElement = paragraphInfoElement;
    this.currentParagraphIndex = 0;
    this.title = title;
    this.paragraphHandler = new ParagraphHandler({
      worlds: worlds,
      worldsDetail,
      parent: sentenceElement,
      paragraph: this.paragraphs[this.currentParagraphIndex]
    });
    this.updateTruncateInfo();
  }

  updateTruncateInfo() {
    this.paragraphInfoElement.innerHTML = `${this.title} (${this.currentParagraphIndex + 1} / ${this.paragraphs.length})`
  }

  nextParagraph() {
    if (this.currentParagraphIndex < this.paragraphs.length - 1) {
      this.currentParagraphIndex++;
      this.paragraphHandler.setParagraph(this.paragraphs[this.currentParagraphIndex], this.currentParagraphIndex);
      this.updateTruncateInfo();
    }
  }

  precisionParagraph() {
    if (this.currentParagraphIndex > 0) {
      this.currentParagraphIndex--;
      this.paragraphHandler.setParagraph(this.paragraphs[this.currentParagraphIndex], this.currentParagraphIndex);
      this.updateTruncateInfo();
    }
  }
}
