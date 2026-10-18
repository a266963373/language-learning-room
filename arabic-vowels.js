// Harakat and dagger alif only. NFC preserves decomposed hamza/madda letters.
const vowels=/[\u064b-\u0652\u0670]/gu;
const hasVowels=text=>/[\u064b-\u0652\u0670]/u.test(text);
export const stripArabicVowels=text=>text.normalize('NFC').replace(vowels,'');
export function arabicVocalization(entry) {
  const matches=text=>typeof text==='string' && hasVowels(text) &&
    /^[\p{Script=Arabic}\p{Mark}\s-]+$/u.test(text) && stripArabicVowels(text)===stripArabicVowels(entry.display);
  if(matches(entry.pronunciation?.reading))return entry.pronunciation.reading;
  const canonical=[...new Set((entry.forms??[]).filter(form=>typeof form==='object' &&
    String(form.description??'').split(/[,;]\s*/).includes('canonical') &&
    !String(form.description??'').includes('error') && matches(form.text)).map(form=>form.text))];
  return canonical.length===1?canonical[0]:null;
}
export function arabicDisplay(text,enabled,vocalization=null) {
  if(!enabled)return stripArabicVowels(text);
  return typeof vocalization==='string' && stripArabicVowels(vocalization)===stripArabicVowels(text)?vocalization:text;
}
