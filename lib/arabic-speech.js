import { createHash } from '../crypto.js';
import { stripArabicVowels } from '../arabic-vowels.js';
import { neuralProfile, textHash } from './neural-tts.js';

export const ARABIC_SPEECH_POLICY = 'arabic-sourced-natural-v1';
export function speechFingerprint(entry, kind) {
  const original = kind === 'word'
    ? [entry.display, entry.meanings, entry.pronunciation ?? null, entry.forms ?? [], entry.provenance ?? null]
    : [entry.sentence?.text, entry.sentence?.meanings, entry.sentence?.provenance ?? null];
  return textHash(JSON.stringify(original));
}
export function arabicLetters(text) { return stripArabicVowels(text).replace(/ٱ/g, 'ا'); }
export function speechRecord(document, entry, kind) {
  if (document?.policy !== ARABIC_SPEECH_POLICY) return null;
  const record = document.entries?.[entry.id]?.[kind];
  const original = kind === 'word' ? entry.display : entry.sentence?.text;
  if (!record || record.status !== 'published' || record.originalText !== original
    || record.sourceFingerprint !== speechFingerprint(entry, kind)
    || typeof record.spokenText !== 'string' || !record.spokenText.trim()
    || record.textSha256 !== textHash(record.spokenText)
    || !record.provenance?.basis || !record.provenance?.sourceUrl) return null;
  // The only consonant-changing exception is a sourced spelling of 'I'.
  if (arabicLetters(record.spokenText) !== arabicLetters(original)
    && !(kind === 'word' && original === 'انا' && record.spokenText === 'أَنَا'
      && record.provenance.basis === 'sourced-alternative-spelling')) return null;
  return record;
}
export function speechPlan(record, kind) {
  return { ...neuralProfile('ar'), kind, spokenText: record.spokenText,
    textSha256: record.textSha256, policy: ARABIC_SPEECH_POLICY };
}
export function validArabicAudio(audio, bytes, text, identity = neuralProfile('ar')) {
  return audio?.provider === 'edge-tts' && audio.synthetic === true && audio.decodeVerified === true
    && audio.textSha256 === textHash(text) && audio.sha256 === createHash('sha256').update(bytes).digest('hex')
    && Object.entries(neuralProfile('ar', identity.providerVersion)).every(([key, value]) => audio[key] === value);
}
