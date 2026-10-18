import { escapeHTML } from './core.js';
import { stripArabicVowels } from './arabic-vowels.js';

const isReading = value => typeof value === 'string' && /\p{Script=Latin}/u.test(value)
  && /^[\p{Script=Latin}\p{M}\p{N}\p{P}\p{Zs}]+$/u.test(value);

// Use the selected dictionary reading, never guess vowels in unvocalized text.
export function arabicTransliterations(entry) {
  const readings = Object.fromEntries(Object.entries(entry.transliterations ?? {})
    .filter(([, reading]) => isReading(reading)));
  const pronunciation = entry.pronunciation;
  const matches = !pronunciation?.reading || stripArabicVowels(pronunciation.reading) === stripArabicVowels(entry.display);
  const forms = [...new Set((entry.forms ?? []).filter(form => typeof form === 'object'
    && String(form.description ?? '').split(/[,;]\s*/).includes('romanization')
    && !String(form.description ?? '').includes('error') && isReading(form.text)).map(form => form.text))];
  const reading = matches && isReading(pronunciation?.romanization) ? pronunciation.romanization
    : matches && forms.length === 1 ? forms[0] : null;
  if (reading) readings[entry.display] = reading;
  return readings;
}

export function arabicTransliteration(text, readings, enabled = false) {
  if (!enabled || typeof text !== 'string') return '';
  let reading = Object.hasOwn(readings ?? {}, text) ? readings[text] : null;
  if (!reading) {
    const matches = [...new Set(Object.entries(readings ?? {})
      .filter(([source]) => stripArabicVowels(source) === stripArabicVowels(text)).map(([, value]) => value))];
    if (matches.length === 1) reading = matches[0];
  }
  return isReading(reading) ? `<span class="arabic-transliteration" lang="ar-Latn" dir="ltr">${escapeHTML(reading)}</span>` : '';
}
