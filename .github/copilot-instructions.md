# AI Coding Instructions for dslming

## Project Overview
dslming is an interactive English learning platform that plays TED talk video segments synchronized with multi-level subtitle/translation data. Users learn vocabulary and practice pronunciation word-by-word while watching videos.

## Architecture & Data Flow

### Three-Article Model
The app supports three curated TED talks stored in `/ted/{firefly,crow,study}/`:
- Each article has: English/Chinese JSON segments (with VTT timecodes), word vocabulary list, and audio URL
- URL routing: `?firefly&1` = article name + sentence index
- Articles configured in `js/app.js` with centralized data paths

### Core Class Responsibilities

| Class | Purpose | Key Pattern |
|-------|---------|------------|
| `ParagraphHandler` | Orchestrates a single sentence: renders UI, controls playback, manages edits | Private fields (#); plays audio via `TextAudioHandler` |
| `TextAudioHandler` | Audio file playback with precise start/end time control | Promise-based; reuses single audio instance |
| `WorldAudioHandler` | Word-level pronunciation (Youdao API + Web Speech API) | Plays word 3x sequentially; uses native speech synthesis as fallback |
| `Slider` | Sidebar menu navigation | DOM event-driven; toggles with overlay/keyboard escape |

### Data Structures
```json
// english.json / chinese.json - synchronized subtitles
{
  "line": [
    {
      "begin": "00:00:06.961",
      "end": "00:00:10.631",
      "content": "Sentence text..."
    }
  ]
}

// detail.json - full vocabulary database (word → meanings)
{
  "word": {
    "world": "lemma",
    "phonetic": "ɪˈnɪʃəl",
    "meaning": [{"pos": "adj.", "meaning": "初期的..."}]
  }
}

// world.txt - one word per line (vocabulary list)
luminous
interact
toxic
```

## Critical Development Patterns

### Time Synchronization
- VTT timestamps: `HH:MM:SS.mmm` → parsed to seconds (see `parseVttTimestampToSeconds`)
- Video format: "M.S.F" (minutes.seconds.frames@30fps) → handled via `timeToSeconds`
- Audio playback: Must pass exact start/end times to avoid overlap

### URL Query Parameters
```javascript
const searchInfo = window.location.search.split('&')
const articleTitle = searchInfo[0].slice(1);  // "?firefly"
const sentenceIndex = searchInfo[1];           // "5"
```
Navigation updates query string; preserve article title to maintain context.

### Audio Pipeline
1. **Text**: `TextAudioHandler.play(startTime, endTime)` clips MP3 from CDN
2. **Words**: `WorldAudioHandler.playWorld(word)` fetches from Youdao API 3 times
3. Loader: `tool/loadAudio.js` converts URL → blob → object URL for CORS isolation

### DOM Interaction Callbacks
Window-level handlers for inline onclick events:
```javascript
window.handleWorldClick(word, index)  // Word pronunciation + definition
window.handleInput(input, expected, index)  // Spell-check feedback
```

## Deployment Notes
- **Production**: Detects `dslming.github.io` → adjusts baseURL to `/dslming/`
- **Local dev**: Direct fetch from `/ted/` paths
- **Audio**: Hosted on `cdn.jsdelivr.net/gh/dslming/assets/audio/`
- **Fallback server**: ngrok endpoint for ML-based word relation (fallback at L8 ParagraphHandler)

## Common Modifications
- **Add article**: Update `articles[]` in `app.js` with new title + data paths
- **Adjust playback speed**: Modify `utterance.rate` in `WorldAudioHandler.playLocal()`
- **Change word source**: Replace Youdao API URL in `playWorld()` or implement `audioTool.js` alternatives
- **Edit styling**: `assets/style.css` (main) and `assets/slider.css` (menu)
