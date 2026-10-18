import { HttpError, requireValue } from './lib/errors.js';
import { validateAssessment, assessmentEntries } from './lib/assessment.js';
import { sha256 } from './crypto.js';
import { renderRule, RULE_VERSION } from './lib/paragraph-rule-grammar.js';
export const LANGUAGE_INFO = {"en":{"name":"英语","selfDescription":"高中水平（自述）","suggestedStage":3},"ja":{"name":"日语","selfDescription":"初中水平（自述）","suggestedStage":3},"ko":{"name":"韩语","selfDescription":"小学水平（自述）","suggestedStage":2},"es":{"name":"西班牙语","selfDescription":"小学水平（自述）","suggestedStage":2},"fr":{"name":"法语","selfDescription":"刚开始（自述）","suggestedStage":1},"ru":{"name":"俄语","selfDescription":"刚开始（自述）","suggestedStage":1},"ar":{"name":"阿拉伯语","selfDescription":"刚开始；现代标准阿拉伯语","suggestedStage":1},"id":{"name":"印度尼西亚语","selfDescription":"零基础（自述）","suggestedStage":1},"hi":{"name":"印地语","selfDescription":"零基础（自述）","suggestedStage":1}};
export function knownLanguage(id) { requireValue(Object.hasOwn(LANGUAGE_INFO,id),'未知语言。'); return id; }
export function knownStage(stage) { requireValue(Number.isInteger(stage)&&stage>=1&&stage<=4,'训练必须为 1–4。'); return stage; }
const sentenceKey=text=>text.normalize('NFKC').toLocaleLowerCase('und').replace(/[\p{P}\p{S}\s_]+/gu,'');
export class OfflineContent {
  constructor(document) {
    this.document=document; this.packs=new Map(); this.assessments=new Map(); this.sentencePacks=new Map(); this.paragraphPacks=new Map(); this.indexes=new Map();this.stageCache=new Map();
    for(const [id,pack] of Object.entries(document.languages)) {
      this.packs.set(id,pack.course);
      if(pack.assessment)this.assessments.set(id,validateAssessment(pack.assessment,id));
      this.sentencePacks.set(id,pack.sentences); this.paragraphPacks.set(id,pack.paragraphs);
      this.indexes.set(id,new Map([...pack.course.entries,...assessmentEntries(pack.assessment),...pack.sentences.entries,...pack.paragraphs.entries].map(entry=>[entry.id,entry])));
    }
  }
  pack(id) { knownLanguage(id); return this.packs.get(id); }
  install(id,pack) {
    this.packs.set(id,pack.course);this.sentencePacks.set(id,pack.sentences);this.paragraphPacks.set(id,pack.paragraphs);this.indexes.set(id,new Map([...pack.course.entries,...this.assessmentEntries(id),...pack.sentences.entries,...pack.paragraphs.entries].map(entry=>[entry.id,entry])));this.stageCache.clear();
  }
  assessment(id) { knownLanguage(id); return this.assessments.get(id); }
  assessmentEntries(id) { return assessmentEntries(this.assessment(id)); }
  words(id) { return [...this.eligible(id,2),...this.assessmentEntries(id)]; }
  paragraphs(id) { knownLanguage(id); return [...(this.paragraphPacks.get(id)?.entries??[]),...(this.runtimeParagraphs?.get(id)??[])]; }
  runtimeParagraphValid(id,entry){
    const text=entry?.sentence?.text;
    if(!(entry?.runtimeGenerated===true&&typeof text==='string'&&text.length<=1000&&entry.id===`${id}:paragraph:${sha256(text).slice(0,24)}`
      &&Array.isArray(entry.paragraphTargets)&&entry.paragraphTargets.length>=2&&entry.paragraphTargets.length<=5
      &&entry.paragraphTargets.every(target=>typeof target.entryId==='string'&&target.entryId.startsWith(id+':'))))return false;
    // Imported source fingerprints may differ because this course overlays
    // helper translations. Preserve snapshots, but verify rule derivations.
    try{if(entry.sentence.provenance?.generator==='rules'){
      if(entry.sentence.provenance.ruleVersion!==RULE_VERSION||renderRule(entry.sentence.provenance.derivation,id).join(' ')!==text)return false;
      for(const [helper,translation] of Object.entries(entry.sentence.meanings))if(renderRule(entry.sentence.provenance.derivation,helper).join(' ')!==translation)return false;
    }return true;}catch{return false;}
  }
  entry(id,entryId) { knownLanguage(id); const entry=this.indexes.get(id).get(entryId)??this.paragraphs(id).find(entry=>entry.id===entryId); if(!entry)throw new HttpError(404,'entry_not_found','词句未发布或不存在。'); return entry; }
  assistance(id,entry) { knownLanguage(id); return entry; }
  eligible(id,stage) {
    const key=`${id}:${stage}`;if(this.stageCache.has(key))return this.stageCache.get(key);
    const pack=this.document.languages[knownLanguage(id)],words=this.packs.get(id).entries;
    const existing=new Set(words.filter(entry=>entry.sentence?.text).map(entry=>sentenceKey(entry.sentence.text)));
    const lessons=stage>=3?this.sentencePacks.get(id).entries.filter(entry=>!existing.has(sentenceKey(entry.sentence.text))):[];
    const allowed=pack.eligible?.[stage]?new Set(pack.eligible[stage]):null;
    const result=[...words,...lessons].filter(entry=>(!allowed||allowed.has(entry.id))&&(stage===3?Boolean(entry.sentence?.text):stage===4?Boolean(entry.output?.prompts&&entry.output.references?.length):true));this.stageCache.set(key,result);return result;
  }
}
