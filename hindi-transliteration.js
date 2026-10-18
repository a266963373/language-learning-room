import { escapeHTML } from './core.js';

export function hindiTransliteration(text, readings, enabled = true) {
  const reading = Object.hasOwn(readings ?? {}, text) ? readings[text] : null;
  if (!enabled || typeof reading !== 'string' || !reading.trim()
    || !/^[\p{Script=Latin}\p{M}\p{N}\p{P}\p{Zs}]+$/u.test(reading)) return '';
  return `<span class="hindi-transliteration" lang="hi-Latn">${escapeHTML(reading)}</span>`;
}
