import { requireValue } from './errors.js';
import { neuralProfile, textHash } from './neural-tts.js';
import { DEFAULT_HELPER_PAIRS } from '../helper-languages.js';
import { speechFingerprint } from './arabic-speech.js';
import { validRuleTarget, renderRule, RULE_VERSION } from './paragraph-rule-grammar.js';

export const wordFingerprint = word => textHash(JSON.stringify([word.id, word.display, word.pos, word.meanings]));
export function paragraphIdentity(id, text) { return `${id}:paragraph:${textHash(text).slice(0, 24)}`; }
export function validateParagraphPack(pack, id, words) {
  requireValue(pack?.schemaVersion === 1 && pack.languageId === id && typeof pack.version === 'string' && Array.isArray(pack.entries), '小段落包格式无效。');
  const dictionary = new Map(words.map(word => [word.id, word])), ids = new Set();
  for (const entry of pack.entries) {
    const sentence = entry.sentence, text = sentence?.text, audio = sentence?.audio;
    requireValue(typeof text === 'string' && text.length >= 20 && text.length <= 1000 && !/[\r\n]/.test(text)
      && entry.id === paragraphIdentity(id, text) && !ids.has(entry.id) && entry.display === text
      && entry.sentenceOnly === true && entry.generatedParagraph === true && entry.rankKind === 'generated-paragraph-priority' && Number.isInteger(entry.rank) && entry.rank > 0, '小段落身份或正文无效。');
    const sentences=[...new Intl.Segmenter(id,{granularity:'sentence'}).segment(text)].length;
    requireValue(sentences>=3&&sentences<=5,'小段落须包含3–5个连贯句子。');
    requireValue(Array.isArray(entry.paragraphTargets) && entry.paragraphTargets.length >= 2 && entry.paragraphTargets.length <= 5
      && new Set(entry.paragraphTargets.map(target => target.entryId)).size === entry.paragraphTargets.length, '每个小段落需要2–5个不同目标词。');
    for (const target of entry.paragraphTargets) {
      const word = dictionary.get(target.entryId);
      requireValue(word && target.display === word.display && target.wordFingerprint === wordFingerprint(word)
        && typeof target.surface === 'string' && (sentence.provenance?.generator==='rules'?validRuleTarget(id,word,target.surface,text):target.surface.normalize('NFC').toLocaleLowerCase(id).includes(word.display.normalize('NFC').toLocaleLowerCase(id))) && text.includes(target.surface), '段落目标词与已教词义或原文不匹配。');
    }
    for (const helper of DEFAULT_HELPER_PAIRS[id]) requireValue(typeof sentence.meanings?.[helper] === 'string' && sentence.meanings[helper].trim(), '小段落缺少辅助译文。');
    const provenance=sentence.provenance;
    requireValue(provenance?.kind==='generated'&&provenance.textSha256===textHash(text)
      &&(provenance.generator==='rules'?provenance.author==='project-rules'&&provenance.review==='controlled-grammar-v1'&&provenance.ruleVersion===RULE_VERSION
        :provenance.review==='ai-authored-and-reviewed-v1'&&provenance.author==='project-ai'),'小段落缺少原创及审核记录。');
    if(provenance.generator==='rules'){
      requireValue(renderRule(provenance.derivation,id).join(' ')===text,'规则推导与段落正文不一致。');
      for(const helper of DEFAULT_HELPER_PAIRS[id])requireValue(renderRule(provenance.derivation,helper).join(' ')===sentence.meanings[helper],'规则正文与辅助译文不一致。');
    }
    if(audio)requireValue(typeof audio?.file === 'string' && audio.file && audio.decodeVerified === true && audio.synthetic === true && audio.spokenText === text
      && audio.textSha256 === textHash(text) && /^[a-f0-9]{64}$/.test(audio.sha256 ?? '')
      && Object.entries(neuralProfile(id)).every(([key, value]) => audio[key] === value), '小段落尚无与整段原文匹配的自然配音。');
    else requireValue(entry.runtimeGenerated===true&&sentence.audioStatus==='on-demand','小段落缺少可选语音计划。');
    requireValue(sentence.audioPlan?.kind === 'sentence' && sentence.audioPlan.spokenText === text
      && sentence.audioPlan.textSha256 === textHash(text)
      && Object.entries(neuralProfile(id)).every(([key, value]) => sentence.audioPlan[key] === value), '小段落声音配置无效。');
    if (id === 'ar') requireValue(entry.arabicSentenceSpeech?.sourceFingerprint === speechFingerprint(entry, 'sentence')
      && entry.arabicSentenceSpeech.spokenText === text && entry.arabicSentenceSpeech.originalText === text
      && entry.arabicSentenceSpeech.status === 'published' && entry.arabicSentenceSpeech.textSha256 === textHash(text), '阿拉伯语整段读法无效。');
    ids.add(entry.id);
  }
  return pack;
}

export function knownWords(language, words) {
  const dictionary = new Map(words.map(word => [word.id, word])), evidence = new Map();
  for (const review of language.reviews) {
    if (!(review.assessedSkill === 'word-meaning' || (review.stage === 2 && !review.assessedSkill))) continue;
    const key = review.canonicalEntryId ?? review.entryId;
    if (!dictionary.has(key)) continue;
    const prior = evidence.get(key), date = Date.parse(review.reviewedAt);
    evidence.set(key, { rating: review.rating, firstSuccess: prior?.firstSuccess ?? (review.rating >= 3 ? date : null), latest: date });
  }
  return new Map([...evidence].filter(([, value]) => value.rating >= 3)
    .sort((a, b) => b[1].firstSuccess - a[1].firstSuccess || b[1].latest - a[1].latest));
}
export class RecentParagraphs {
  constructor(content, media) { this.content = content; this.media = media; }
  index(id) { return { rows: this.content.paragraphs(id).map(entry => ({ entry })) }; }
  candidates(id, language, now) {
    const known = knownWords(language, this.content.eligible(id, 2)), recent = new Set([...known.keys()].slice(0, 40));
    const seen=new Set(language.reviews.filter(review=>review.assessedSkill==='word-meaning'||review.stage===2&&!review.assessedSkill).map(review=>review.canonicalEntryId??review.entryId));
    return this.index(id).rows.filter(({ entry }) => (!this.content.runtimeGenerationEnabled||entry.runtimeGenerated)
      && (entry.runtimeGenerated?entry.paragraphTargets.every(target=>seen.has(target.entryId)):entry.paragraphTargets.every(target => known.has(target.entryId))
      && entry.paragraphTargets.filter(target => recent.has(target.entryId)).length >= 2))
      .map(({ entry }) => ({ entry, targets: entry.paragraphTargets.map(({ entryId, display, reason }) => ({ entryId, display, ...(reason?{reason}:{}) })),
        score: entry.runtimeGenerated?Date.parse(entry.createdAt):Math.max(...entry.paragraphTargets.map(target => known.get(target.entryId).firstSuccess)) }))
      .sort((a, b) => b.score - a.score || a.entry.rank - b.entry.rank);
  }
}
