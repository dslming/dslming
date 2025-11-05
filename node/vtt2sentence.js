import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { version } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 当前脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const name = "crow"

// 文件路径
const inputPath = new URL(`${__dirname}/../ted/${name}/orgin.vtt`, import.meta.url).pathname;
const outputPath = new URL(`${__dirname}/../ted/${name}/segment.json`, import.meta.url).pathname;
const outputDir = dirname(outputPath);

// 句子结束标点（支持中英文）
const sentenceEndRE = /[.!?\u3002\uFF01\uFF1F]/; // . 。 ! ?

/**
 * 解析时间戳行
 */
function parseTimestamp(line) {
  const m = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
  return m ? { start: m[1], end: m[2] } : null;
}

/**
 * 合并两个时间区间
 */
function mergeTimeRange(a, b) {
  return {
    start: a.start < b.start ? a.start : b.start,
    end: a.end > b.end ? a.end : b.end,
  };
}

async function convertToSentenceJSON() {
  try {
    await mkdir(outputDir, { recursive: true });

    const data = await readFile(inputPath, 'utf8');
    const lines = data.split('\n');

    const resultLines = []; // 最终的 JSON 条目数组
    let currentText = '';
    let currentTimeRange = null;

    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      // 跳过空行、WEBVTT、NOTE、纯数字 cue ID
      if (
        !line ||
        line.startsWith('WEBVTT') ||
        line.startsWith('NOTE') ||
        /^\d+$/.test(line)
      ) {
        i++;
        continue;
      }

      // 检测时间戳
      const timeObj = parseTimestamp(line);
      if (timeObj) {
        // 读取该时间段下的所有文本行
        let cueText = '';
        i++;
        while (i < lines.length) {
          const nextRaw = lines[i];
          const next = nextRaw.trim();
          if (!next || parseTimestamp(next) || /^\d+$/.test(next) || next.startsWith('NOTE')) {
            break;
          }
          cueText += (cueText ? ' ' : '') + nextRaw;
          i++;
        }

        const cleanedCue = cueText.replace(/\s+/g, ' ').trim();
        if (!cleanedCue) continue;

        // 初始化或合并时间区间
        if (!currentTimeRange) {
          currentTimeRange = { ...timeObj };
        } else {
          currentTimeRange = mergeTimeRange(currentTimeRange, timeObj);
        }

        // 拼接文本
        currentText = currentText ? `${currentText} ${cleanedCue}` : cleanedCue;

        // 检查是否构成完整句子
        if (sentenceEndRE.test(currentText)) {
          const finalSentence = currentText.trim().replace(/\s+/g, ' ');
          resultLines.push({
            begin: currentTimeRange.start,
            end: currentTimeRange.end,
            content: finalSentence,
          });

          // 重置
          currentText = '';
          currentTimeRange = null;
        }

        continue;
      }

      i++;
    }

    // 处理最后未结束的句子（保留）
    if (currentText && currentTimeRange) {
      const finalSentence = currentText.trim().replace(/\s+/g, ' ');
      resultLines.push({
        begin: currentTimeRange.start,
        end: currentTimeRange.end,
        content: finalSentence,
      });
    }

    // 构造 JSON 内容
    const outputJSON = {
      version: "1.1.0",
      line: resultLines,
    };

    await writeFile(outputPath, JSON.stringify(outputJSON, null, 2), 'utf8');

    console.log(`成功生成 ${resultLines.length} 条句子 JSON`);
    console.log(`保存到: ${outputPath}`);
  } catch (err) {
    console.error('处理失败:', err);
  }
}

// 执行
convertToSentenceJSON();
