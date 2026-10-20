import { wordSegments } from './recent-words.js';
import { readabilityContext,reviewReadability } from './review-readability.js';
import { ruleLexemes,ruleOccurrence } from './paragraph-rule-grammar.js';

const normalized=(text,id)=>text.normalize('NFC').toLocaleLowerCase(id).replace(id==='ar'?/[\u064B-\u0652\u0670]/gu:/$^/gu,'');
function compatibleReference(id,word,sentence,index){
  // Existing literal dictionary links are not contextual sense annotations.
  // Guard common homographs rather than presenting them as the taught use.
  if(id==='ja'&&['particle','suffix'].includes(word.pos)){
    const bound=ruleLexemes(id,[{word}])[0];return Boolean(bound&&ruleOccurrence(id,bound.rule,sentence.text));
  }
  if(id==='ar'&&word.display==='من'&&word.pos==='prep'&&/^\s*من\s+(?:أنا|أنت|هو|هي|نحن|هذا|هذه)/u.test(normalized(sentence.text,id)))return false;
  if(id==='es'&&word.display==='de'&&/possession|thing owned|owner/.test(word.meanings?.en??'')&&/\b(?:soy|eres|es|somos|sois|son) de\b/iu.test(sentence.text))return false;
  if(word.pos==='article'){
    const parts=wordSegments(sentence.text,id),at=parts.indexOf(normalized(word.display,id)),next=parts[at+1];
    if(!next)return false;return [...index.words.values()].some(entry=>['noun','adj'].includes(entry.pos)&&normalized(entry.display,id)===next);
  }
  return true;
}
function surfaceFor(id,word,sentence,linked){
  const review=sentence.contextReview;
  if(linked&&review&&typeof review==='object'&&review.target===word.display&&typeof review.targetSpan==='string'&&sentence.text.includes(review.targetSpan)){
    // Reviewed Korean noun + case/topic suffixes are explicit safe forms;
    // this is not a general substring or morphological inference rule.
    if(id==='ko')for(const part of new Intl.Segmenter(id,{granularity:'word'}).segment(sentence.text))if(part.isWordLike&&part.segment.startsWith(review.targetSpan)&&/^(?:은|는|이|가|을|를|에|에서|도|와|과)?$/.test(part.segment.slice(review.targetSpan.length)))return part.segment;
    return review.targetSpan;
  }
  const parts=[...new Intl.Segmenter(id,{granularity:'word'}).segment(sentence.text)].filter(part=>part.isWordLike),wanted=wordSegments(word.display,id);
  for(let at=0;at<parts.length;at++)if(wanted.length&&wanted.every((text,n)=>normalized(parts[at+n]?.segment??'',id)===text)){
    const last=parts[at+wanted.length-1];return sentence.text.slice(parts[at].index,last.index+last.segment.length);
  }return null;
}
export class WordExamples {
  constructor(content,media,sentenceIndex){this.content=content;this.media=media;this.sentenceIndex=sentenceIndex;}
  select(id,word,language,helpers){
    const index=this.sentenceIndex.index(id),evidenceWords=[...index.words.values()];
    if(!index.words.has(word.id))evidenceWords.push(word);
    // The word just revealed is the teaching target, not a newly earned
    // successful review. This temporary context never enters the save file.
    const context=readabilityContext(id,{reviews:[...language.reviews,{entryId:word.id,stage:2,rating:1}]},evidenceWords);
    const phrase=wordSegments(word.display,id).join('\u0001');
    const rows=index.rows.filter(row=>row.matches.has(word.id)||phrase&&row.parts.join('\u0001').includes(phrase));
    if(word.sentence?.text&&!rows.some(row=>row.entry.id===word.id))rows.push({entry:word});
    let best=null;const seen=new Set();
    for(const row of rows){
      const entry=row.entry,display=this.content.assistance?.(id,entry)??entry,sentence=display.sentence;
      if(!sentence?.text||seen.has(sentence.text))continue;seen.add(sentence.text);
      if(entry.id===word.id&&sentence.contextReview?.approvedDictionaryMeaning&&sentence.contextReview.approvedDictionaryMeaning!==word.meanings?.en)continue;
      if(helpers.some(helper=>!sentence.meanings?.[helper]?.trim()))continue;
      const review=sentence.contextReview,linked=entry.id===word.id&&(typeof review==='string'&&Boolean(review.trim())||review&&typeof review==='object'&&review.target===word.display),surface=surfaceFor(id,word,sentence,linked);if(!surface)continue;
      if(!linked&&!compatibleReference(id,word,sentence,index))continue;
      const target={entryId:word.id,display:word.display,surface};
      const readability=reviewReadability(context,sentence.text,[target]);
      if(readability.totalTokens>(['ja','ko'].includes(id)?18:12)||readability.unknownCount>2)continue;
      const supportWords=[];
      for(const text of readability.unknownWords){
        const support=evidenceWords.find(item=>normalized(item.display,id)===normalized(text,id)||(id==='ar'&&normalized(text,id).startsWith('ال')&&normalized(item.display,id)===normalized(text,id).slice(2)));
        if(!support)break;
        const supported=this.content.assistance?.(id,support)??support;
        if(!supported.meanings?.en&&!helpers.some(helper=>supported.meanings?.[helper]))break;
        supportWords.push({entryId:support.id,text,meanings:supported.meanings});
      }
      if(supportWords.length!==readability.unknownCount)continue;
      const score=readability.unknownCount*100+readability.totalTokens*2-(linked?15:0);
      if(!best||score<best.score)best={score,entryId:entry.id,sentence:{id:sentence.id,text:sentence.text,meanings:sentence.meanings,provenance:sentence.provenance},target,
        matchKind:linked?'linked-sense':'literal-reference',supportWords,unknownCount:readability.unknownCount,
        hasAudio:Boolean(this.media.hasPreparedSentence(id,entry)),helperTranslationProvenance:display.helperTranslationProvenance?.sentence??{}};
    }
    if(!best)return{example:null,reason:'no-simple-example'};
    const {score,...example}=best;return{example};
  }
}
