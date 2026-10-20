import {mnemonicData} from './mnemonic-data.js';
import {escapeHTML as esc} from './core.js';

const index=new Map(mnemonicData.rows.map(row=>[row.entryId,row]));
const names={zh:'中文',en:'英语',ja:'日语',ko:'韩语',es:'西班牙语'};
export const mnemonicCoverage=mnemonicData.counts;
export function wordMnemonic(item,languageId) {
  const row=index.get(item?.entryId??item?.id);
  if(!row||row.languageId!==languageId||row.display!==item.display||row.sourceMeaning!==item.meanings?.en)return null;
  return row;
}
export function mnemonicMarkup(item,languageId,ui='zh') {
  const row=wordMnemonic(item,languageId),zh=ui==='zh';
  if(!row)return `<p class="mnemonic-pending" lang="${zh?'zh':'en'}">${zh?'此词的助记尚未编写。':'A memory cue for this word is not ready yet.'}</p>`;
  const kind={sound:zh?'近音联想':'Sound association',form:zh?'词形联想':'Word-form association',scene:zh?'场景联想':'Scene association'}[row.kind];
  return `<section class="word-mnemonic" aria-label="${zh?'记忆小故事':'Memory cue'}" lang="zh"><h3>${zh?'记忆小故事':'Memory cue'} <span>${esc(kind)}</span></h3><p class="mnemonic-cue"><span>${esc(names[row.cueLanguage])}</span> <bdi dir="auto">${esc(row.cue)}</bdi></p><p class="mnemonic-story">${esc(row.story)}</p><p class="mnemonic-note">${zh?'AI编写 · 联想不是词源；读音以音频为准。':'AI-authored Chinese cue · Association, not etymology. Follow the audio for pronunciation.'}</p></section>`;
}
