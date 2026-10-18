import { ruleLexemes } from './paragraph-rule-grammar.js';
export const REVIEW_READABILITY_POLICY='familiar-context-1';
const normalize=(text,id)=>text.normalize('NFC').toLocaleLowerCase(id).replace(id==='ar'?/[\u064B-\u0652\u0670]/gu:/$^/gu,'');
export function meaningEvidence(language,words){
  const dictionary=new Map(words.map(word=>[word.id,word])),evidence=new Map();
  for(const review of language.reviews??[]){
    if(!(review.assessedSkill==='word-meaning'||review.stage===2&&!review.assessedSkill))continue;
    const id=review.canonicalEntryId??review.entryId;if(!dictionary.has(id)||![1,2,3,4].includes(review.rating))continue;
    const prior=evidence.get(id),date=Date.parse(review.reviewedAt);
    evidence.set(id,{word:dictionary.get(id),rating:review.rating,last:Number.isFinite(date)?date:0,
      firstSuccess:prior?.firstSuccess??(review.rating>=3&&Number.isFinite(date)?date:null)});
  }return evidence;
}
export function readabilityContext(id,language,words){
  const evidence=meaningEvidence(language,words),forms=new Set();
  for(const row of evidence.values())if(row.rating>=3)forms.add(normalize(row.word.display,id));
  // Only the closed grammar's explicit forms can establish a known inflection.
  for(const row of ruleLexemes(id,[...evidence.values()].filter(row=>row.rating>=3)))for(const form of row.rule.forms)if(!['ja','ko'].includes(id)||!['particle','suffix'].includes(row.word.pos))forms.add(normalize(form,id));
  const segmenter=new Intl.Segmenter(id,{granularity:'word'});
  const phrases=new Map();
  for(const form of forms){const parts=[...segmenter.segment(form)].filter(part=>part.isWordLike).map(part=>normalize(part.segment,id));if(parts.length){if(!phrases.has(parts[0]))phrases.set(parts[0],[]);phrases.get(parts[0]).push(parts);}}
  return{id,evidence,forms,phrases,segmenter,words};
}
export function reviewReadability(context,text,targets=[],{allowGloss=false}={}){
  const {id,forms,segmenter,evidence}=context,tokens=[...segmenter.segment(text)].filter(part=>part.isWordLike),covered=new Set();
  // Multi-token taught expressions count only as full expressions.
  const matches=(form)=>{
    const parts=[...segmenter.segment(form)].filter(part=>part.isWordLike).map(part=>normalize(part.segment,id));
    for(let at=0;at<tokens.length;at++)if(parts.length&&parts.every((part,n)=>normalize(tokens[at+n]?.segment??'',id)===part))for(let n=0;n<parts.length;n++)covered.add(at+n);
  };
  for(let at=0;at<tokens.length;at++)for(const parts of context.phrases.get(normalize(tokens[at].segment,id))??[])
    if(parts.every((part,n)=>normalize(tokens[at+n]?.segment??'',id)===part))for(let n=0;n<parts.length;n++)covered.add(at+n);
  for(const target of targets){
    // Targets may be fragile, but must have actual meaning practice evidence.
    const row=evidence.get(target.entryId);if(!row)continue;matches(row.word.display);
    if(target.surface){
      if(['ja','ko'].includes(id)&&['particle','suffix'].includes(row.word.pos))continue;
      matches(target.surface);
    }
  }
  const missing=new Map();
  tokens.forEach((token,index)=>{if(!covered.has(index))missing.set(normalize(token.segment,id),token.segment);});
  const unknown=[...missing.values()],ratio=tokens.length?covered.size/tokens.length:0;
  const aids=[];
  if(allowGloss&&unknown.length===1){
    const text=unknown[0],key=normalize(text,id),word=context.words.find(word=>normalize(word.display,id)===key);
    const authored={ru:{'здесь':{en:'here',ja:'ここ',zh:'这里'}},en:{'here':{en:'here',zh:'这里',ja:'ここ'}},ko:{'여기':{en:'here',zh:'这里',ja:'ここ'}},ja:{'ここ':{en:'here',zh:'这里'}},es:{'aquí':{en:'here',ja:'ここ',zh:'这里'}},fr:{'ici':{en:'here',es:'aquí',zh:'这里'}},id:{'sini':{en:'here',es:'aquí',zh:'这里'}},hi:{'यहाँ':{en:'here',es:'aquí',zh:'这里'}},ar:{'هنا':{en:'here',ja:'ここ',zh:'这里'}}};
    const meanings=authored[id]?.[key]??word?.meanings;
    if(meanings?.en)aids.push({text,meanings});
  }
  // Every background word must be evidenced. A single explicitly glossed
  // support word is allowed only when at least 85% of tokens are evidenced.
  return{policy:REVIEW_READABILITY_POLICY,allowed:unknown.length===0||allowGloss&&unknown.length===1&&aids.length===1&&ratio>=.85,
    totalTokens:tokens.length,unknownCount:unknown.length,knownTokenRatio:ratio,supportWords:aids,unknownWords:unknown};
}
