import { trainingDifficulty } from './adaptive.js';
import { readabilityContext, reviewReadability } from './review-readability.js';

// Word boundaries are deliberate: never count 'he' inside 'the', or infer
// an unknown conjugation/meaning from a substring. Coverage is only a hint.
export function wordSegments(text, languageId) {
  const normalized = text.normalize('NFC').toLocaleLowerCase(languageId)
    .replace(languageId === 'ar' ? /[\u064B-\u0652\u0670]/gu : /$^/gu, '');
  return [...new Intl.Segmenter(languageId, { granularity: 'word' }).segment(normalized)]
    .filter(part => part.isWordLike).map(part => part.segment);
}
const phraseKey = parts => parts.join('\u0001');
export class RecentWords {
  constructor(content, media) { this.content = content; this.media = media; this.indexes = new Map(); }
  index(id) {
    const pack = this.content.pack(id), sentences = this.content.sentencePacks.get(id);
    const previous = this.indexes.get(id);
    if (previous?.pack === pack && previous?.sentences === sentences) return previous;
    const words = this.content.eligible(id, 2), forms = new Map();
    for (const word of words) {
      // Use the taught spelling. Related dictionary forms can represent a
      // different sense and are not silently treated as learned.
      const parts = wordSegments(word.display, id);
      if (parts.length) {
        const key = phraseKey(parts);
        if (!forms.has(key)) forms.set(key, []);
        forms.get(key).push(word.id);
      }
    }
    const rows = this.content.eligible(id, 3).filter(entry => entry.sentenceOnly && this.media.hasPreparedSentence(id, entry)).map(entry => {
      const parts = wordSegments(entry.sentence.text, id), matches = new Set();
      const covered = new Map();
      for (let start = 0; start < parts.length; start++) for (let size = 1; size <= 5 && start + size <= parts.length; size++) {
        for (const wordId of forms.get(phraseKey(parts.slice(start, start + size))) ?? []) {
          matches.add(wordId);
          if (!covered.has(wordId)) covered.set(wordId, new Set());
          for (let at = start; at < start + size; at++) covered.get(wordId).add(at);
        }
      }
      return { entry, parts, matches, covered };
    });
    const result = { pack, sentences, rows, words: new Map(words.map(word => [word.id, word])) };
    this.indexes.set(id, result); return result;
  }
  candidates(id, language, now) {
    const index = this.index(id), evidence = new Map();
    for (const review of language.reviews) {
      if (!(review.assessedSkill === 'word-meaning' || (review.stage === 2 && !review.assessedSkill))) continue;
      const wordId = review.canonicalEntryId ?? review.entryId;
      if (!index.words.has(wordId)) continue;
      const prior = evidence.get(wordId);
      const date = Date.parse(review.reviewedAt);
      evidence.set(wordId, { rating: review.rating, firstSuccess: prior?.firstSuccess ?? (review.rating >= 3 ? date : null), latest: date });
    }
    const known = new Set([...evidence].filter(([, value]) => value.rating >= 3).map(([wordId]) => wordId));
    const targets = new Map([...evidence].filter(([wordId]) => known.has(wordId))
      .sort((a, b) => b[1].firstSuccess - a[1].firstSuccess || b[1].latest - a[1].latest).slice(0, 40));
    const result = [];
    const readability=readabilityContext(id,language,[...index.words.values()]);
    const lastSentences = new Map(language.reviews.filter(review => review.stage === 3).map(review => [review.entryId, review]));
    for (const row of index.rows) {
      const matched = [...row.matches].filter(wordId => targets.has(wordId)).sort((a,b)=>targets.get(b).firstSuccess-targets.get(a).firstSuccess||targets.get(b).latest-targets.get(a).latest);
      if (!matched.length || row.parts.length > 24 || trainingDifficulty(row.entry, 3).score > 3) continue;
      if(!reviewReadability(readability,row.entry.sentence.text).allowed)continue;
      const knownPositions = new Set();
      for (const wordId of row.matches) if (known.has(wordId)) for (const at of row.covered.get(wordId)) knownPositions.add(at);
      const age = Math.max(0, (now.getTime() - Math.max(...matched.map(wordId => targets.get(wordId).firstSuccess))) / 86400000);
      const last = lastSentences.get(row.entry.id);
      // Do not immediately recycle today's successful sentences once the pool
      // runs out. Due cards are selected separately by Learning.
      if (last && now.getTime() - Date.parse(last.reviewedAt) < 20 * 3600000) continue;
      const score = 30 / (1 + age / 7) + Math.min(matched.length, 3) * 4
        - (row.parts.length - knownPositions.size) * 1.5 - row.parts.length * .3;
      result.push({ entry: row.entry, score, targets: matched.slice(0, 3).map(wordId => ({ entryId: wordId, display: index.words.get(wordId).display,reason:'recent',surface:index.words.get(wordId).display })) });
    }
    return result.sort((a, b) => b.score - a.score || a.entry.rank - b.entry.rank);
  }
}
