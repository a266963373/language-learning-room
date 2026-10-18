import { escapeHTML } from './core.js';
export function japaneseMarkup(text,readings,start=0,end=text.length) {
  const parts=Object.hasOwn(readings??{},text)?readings[text]:null;
  if(!Array.isArray(parts) || parts.some(p=>typeof p?.text!=='string' || (p.reading!==undefined && (!/[\p{Script=Han}々〻]/u.test(p.text) || !/^[\p{Script=Hiragana}ー]+$/u.test(p.reading)))) || parts.map(p=>p.text).join('')!==text)return escapeHTML(text.slice(start,end));
  let offset=0;
  return parts.map(p=>{
    const begin=offset;offset+=p.text.length;
    if(offset<=start || begin>=end)return '';
    const surface=escapeHTML(p.text.slice(Math.max(0,start-begin),Math.min(p.text.length,end-begin)));
    return surface+(p.reading && offset<=end?`<span class="kana-reading">（${escapeHTML(p.reading)}）</span>`:'');
  }).join('');
}
