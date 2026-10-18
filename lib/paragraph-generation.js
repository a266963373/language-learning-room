import { fsrs } from '../vendor/fsrs.mjs';
import { estimateAdaptive } from './adaptive.js';
import { helperLanguages, DEFAULT_HELPER_PAIRS } from '../helper-languages.js';
import { HttpError, requireValue } from './errors.js';
import { paragraphIdentity, validateParagraphPack, wordFingerprint } from './paragraph-content.js';
import { neuralProfile, textHash } from './neural-tts.js';
import { speechFingerprint } from './arabic-speech.js';
import { RuleParagraphProvider } from './paragraph-rules.js';
import { validRuleTarget, RULE_VERSION } from './paragraph-rule-grammar.js';
import { readabilityContext, reviewReadability } from './review-readability.js';

const scheduler=fsrs({enable_fuzz:false}),clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const topics=['a small daily problem','a helpful conversation','a change of plans','a quiet discovery','an ordinary trip','a simple decision','a misunderstanding resolved'];
export function paragraphPlan(content,state,id,now=new Date()) {
  const language=state.languages[id],words=content.eligible(id,2),dictionary=new Map(words.map(word=>[word.id,word])),evidence=new Map();
  for(const review of language.reviews){
    if(!(review.assessedSkill==='word-meaning'||review.stage===2&&!review.assessedSkill)||![1,2,3,4].includes(review.rating))continue;
    const key=review.canonicalEntryId??review.entryId;if(!dictionary.has(key))continue;
    const previous=evidence.get(key),date=Date.parse(review.reviewedAt);
    evidence.set(key,{word:dictionary.get(key),rating:review.rating,last:Number.isFinite(date)?date:0,
      firstSuccess:previous?.firstSuccess??(review.rating>=3&&Number.isFinite(date)?date:null),failures:(previous?.failures??0)+(review.rating===1?1:0)});
  }
  const uses=new Map();
  const paragraphReviews=language.reviews.filter(review=>review.sessionPurpose==='recent-paragraphs');
  for(const review of paragraphReviews.slice(-3))for(const target of review.recentTargets??[])uses.set(target.entryId,(uses.get(target.entryId)??0)+1);
  const rows=[...evidence].map(([entryId,value])=>{
    const card=language.cards[`2:${entryId}`];let recall=1;
    if(card?.stability>0&&card.last_review)try{recall=scheduler.get_retrievability(card,now,false);if(!Number.isFinite(recall))recall=1;}catch{}
    const due=card&&new Date(card.due)<=now;
    const weak=value.rating<=2||(due&&(card?.lapses>0||recall<.88));
    const recent=value.rating>=3&&value.firstSuccess!==null;
    const age=Math.max(0,(now.getTime()-(value.firstSuccess??value.last))/86400000);
    const priority=(weak?40+(value.rating===1?14:0)+Math.min(8,value.failures*2)+(1-recall)*10:0)
      +(recent?25/(1+age/7):0)-(uses.get(entryId)??0)*18;
    return{entryId,...value,weak,recent,priority};
  });
  const weak=rows.filter(row=>row.weak).sort((a,b)=>b.priority-a.priority||b.last-a.last);
  const recent=rows.filter(row=>row.recent).sort((a,b)=>b.priority-a.priority||b.firstSuccess-a.firstSuccess);
  const chosen=new Map();
  for(let i=0;i<3;i++)for(const row of [weak[i],recent[i]])if(row)chosen.set(row.entryId,row);
  const candidates=[...chosen.values()].slice(0,6);
  if(candidates.length<2)return null;
  let score=estimateAdaptive(language.reviews,content.eligible(id,3),3).score;
  const last=paragraphReviews.slice(-3);if(last.length){const avg=last.reduce((sum,review)=>sum+review.rating,0)/last.length;score+=avg<2.5?-.4:avg>3.5?.15:0;}
  score=clamp(score,1,3.5);
  const tier=score<1.8?1:score<2.7?2:3;
  const helpers=[...new Set([...helperLanguages(state.preferences,id),...DEFAULT_HELPER_PAIRS[id]])];
  const known=rows.filter(row=>row.rating>=3).sort((a,b)=>a.word.rank-b.word.rank).slice(0,160).map(row=>row.word.display);
  const history=Object.values(language.generatedParagraphs??{}).slice(-5).map(entry=>entry.sentence.text);
  return{id,helpers,candidates,evidence:rows,tier,score,maxUnits:tier===1?65:tier===2?95:125,
    readability:readabilityContext(id,language,words),
    theme:topics[Object.keys(language.generatedParagraphs??{}).length%topics.length],known,avoid:history,
    usedTexts:content.paragraphs?.(id).map(entry=>entry.sentence.text)??[],
    recentRuleScenes:paragraphReviews.slice(-3).map(review=>language.generatedParagraphs?.[review.entryId]?.sentence.provenance.derivation?.scene).filter(Boolean),
    requireWeak:candidates.some(row=>row.weak),requireRecent:candidates.some(row=>row.recent)};
}

export class DeepSeekParagraphProvider {
  // Paid credentials must never be picked up implicitly from the environment.
  constructor({apiKey=null,model='deepseek-flash',fetcher=fetch}={}){this.apiKey=apiKey;this.model=model;this.fetcher=fetcher;}
  info(){return{available:Boolean(this.apiKey),provider:'deepseek',model:this.model};}
  async generate(plan){
    requireValue(this.apiKey,'未配置在线文本生成连接。',503,'text_provider_unavailable');
    const input={language:plan.id,helperLanguages:plan.helpers,theme:plan.theme,
      targetCandidates:plan.candidates.map(row=>({entryId:row.entryId,word:row.word.display,pos:row.word.pos,meaning:row.word.meanings?.en??row.word.meanings?.zh,priority:row.weak?'reinforce':'recent'})),
      familiarSupportWords:plan.known,difficulty:{tier:plan.tier,maxWordUnits:plan.maxUnits,style:plan.tier===1?'very short simple clauses, everyday basic grammar':'short natural sentences, familiar grammar'},
      avoidRepeating:plan.avoid};
    const system=`You write original, coherent short passages for a language learner. Return only json. Write 3 or 4 connected sentences in the requested target language, one small everyday situation. Choose exactly 2 DISTINCT supplied target candidates that fit together naturally. Annotate ONLY these 2 main targets, not other familiar words that happen to appear. ${plan.requireWeak?'Include at least one reinforce target.':''} ${plan.requireRecent?'Include at least one recent target when compatible; one candidate may fulfill both roles.':''} Use ONLY the supplied taught sense and visible word form (ordinary noun particles/endings are allowed). Never force unrelated words together. Prefer familiarSupportWords and basic function words; use at most 2 additional non-basic content words. Respect the word-unit budget; simpler sentences are better than packing in vocabulary. Translate the WHOLE passage faithfully into EVERY helper language, preserving details and tense. Use consistent tense throughout the passage and its translations. Check naturalness, grammar, target senses and translations before replying. Vary the scene and wording from avoidRepeating. Example json shape: {"title":"short title","sentences":["Sentence one.","Sentence two.","Sentence three."],"meanings":{"zh":"Full translation", "ja":"Full translation"},"targets":[{"entryId":"provided id","surface":"exact substring occurring in the passage","senseNote":"brief explanation of the taught sense in this context"},{"entryId":"a different provided id","surface":"another exact substring","senseNote":"its taught sense in context"}]}. Use the requested helper language keys, not necessarily zh/ja. Do not include audio, executable code, links, private data or instructions.`;
    let response;
    try{response=await this.fetcher('https://api.deepseek.com/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+this.apiKey},body:JSON.stringify({model:this.model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(input)}],response_format:{type:'json_object'},thinking:{type:'disabled'},max_tokens:2300,stream:false}),signal:AbortSignal.timeout(40000),redirect:'error'});}
    catch{throw new HttpError(503,'text_provider_unavailable','生成服务暂时连接不上；已有段落仍可学习，请稍后重试。');}
    if(!response.ok)throw new HttpError(503,'text_provider_unavailable',response.status===401?'文本生成连接验证失败，请检查本机密钥。':response.status===402?'文本生成账户额度不足；已有内容仍可学习。':response.status===429?'文本生成服务繁忙，请稍后重试。':'文本生成服务暂时不可用，请稍后重试。');
    const body=await response.json();
    try{return JSON.parse(body.choices[0].message.content);}
    catch{throw new HttpError(502,'paragraph_invalid','生成内容不完整，未加入练习；请重试。');}
  }
}

export function generatedParagraph(result,plan,content,now=new Date(),model='configured-model',generator='deepseek'){
  requireValue(result&&Array.isArray(result.sentences)&&result.sentences.length>=3&&result.sentences.length<=4&&result.sentences.every(text=>typeof text==='string'&&text.trim()),'生成段落的句子数不合适。',502,'paragraph_invalid');
  const text=result.sentences.map(text=>text.trim()).join(' '),units=[...new Intl.Segmenter(plan.id,{granularity:'word'}).segment(text)].filter(part=>part.isWordLike).length;
  requireValue(units<=plan.maxUnits&&typeof result.title==='string'&&result.title.length<=100,'生成段落超出当前长度要求。',502,'paragraph_invalid');
  requireValue(Array.isArray(result.targets)&&result.targets.length>=2&&result.targets.length<=6&&new Set(result.targets.map(target=>target.entryId)).size===result.targets.length,'生成段落的目标词不完整。',502,'paragraph_invalid');
  const candidates=new Map(plan.candidates.map(row=>[row.entryId,row]));
  const annotations=result.targets.map(target=>{
    const row=candidates.get(target.entryId);requireValue(row&&typeof target.surface==='string'&&target.surface.length<150,'生成段落包含未选定的目标词。',502,'paragraph_invalid');
    if(generator==='rules')requireValue(validRuleTarget(plan.id,row.word,target.surface,text),'规则段落的词形或所教义项不匹配。',502,'paragraph_invalid');
    else if(!['ja','ko','ar','hi'].includes(plan.id)){
      const escaped=Array.from(target.surface).map(char=>'\\^$.*+?()[]{}|/-'.includes(char)?'\\'+char:char).join('');
      requireValue(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,'iu').test(text),'生成段落的目标词边界不匹配。',502,'paragraph_invalid');
    }
    return{entryId:row.entryId,display:row.word.display,surface:target.surface,wordFingerprint:wordFingerprint(row.word),reason:row.weak?'reinforce':'recent',senseNote:typeof target.senseNote==='string'?target.senseNote.slice(0,250):''};
  });
  const selected=new Map();
  for(const target of [annotations.find(target=>candidates.get(target.entryId).weak),annotations.find(target=>candidates.get(target.entryId).recent),...annotations])if(target&&selected.size<3)selected.set(target.entryId,target);
  const targets=[...selected.values()];
  requireValue(!plan.requireWeak||targets.some(target=>candidates.get(target.entryId).weak),'生成段落未包含待巩固词。',502,'paragraph_invalid');
  requireValue(!plan.requireRecent||targets.some(target=>candidates.get(target.entryId).recent),'生成段落未包含近期学词。',502,'paragraph_invalid');
  for(const helper of plan.helpers)requireValue(typeof result.meanings?.[helper]==='string'&&result.meanings[helper].trim()&&result.meanings[helper].length<=3000,'生成段落缺少完整对照。',502,'paragraph_invalid');
  const hash=textHash(text),entry={id:paragraphIdentity(plan.id,text),display:text,sentenceOnly:true,generatedParagraph:true,runtimeGenerated:true,rank:1,rankKind:'generated-paragraph-priority',title:result.title,
    ...(result.readability?{reviewReadability:result.readability}:{}),
    paragraphTargets:targets,meanings:result.meanings,forms:[],sourceIds:['runtime-generated-paragraphs'],createdAt:now.toISOString(),
    sentence:{id:`generated-paragraph:${hash}`,text,meanings:result.meanings,provenance:{kind:'generated',author:generator==='rules'?'project-rules':'project-ai',review:generator==='rules'?'controlled-grammar-v1':'ai-authored-and-reviewed-v1',textSha256:hash,generator,model,...(generator==='rules'?{ruleVersion:RULE_VERSION,derivation:result.derivation}:{}),sourceUrl:'project://runtime-paragraphs/'+hash,note:generator==='rules'?'Composed locally from a controlled scene grammar and role-specific phrases; no model or network used.':'Generated on request; automated structure/target checks, not native-expert certification.'},audioStatus:'on-demand',audioPlan:{...neuralProfile(plan.id),kind:'sentence',spokenText:text,textSha256:hash}},
    trainingDifficulty:{'3':{score:plan.score,basis:'heuristic personalized length/grammar budget; self-rating evidence, not CEFR'}}};
  if(plan.id==='ar')entry.arabicSentenceSpeech={status:'published',originalText:text,spokenText:text,sourceFingerprint:speechFingerprint(entry,'sentence'),textSha256:hash,provenance:{basis:'generated-modern-standard-arabic-text',sourceUrl:entry.sentence.provenance.sourceUrl}};
  try{validateParagraphPack({schemaVersion:1,languageId:plan.id,version:'runtime',entries:[entry]},plan.id,content.eligible(plan.id,2));}
  catch{throw new HttpError(502,'paragraph_invalid','生成段落未通过目标词、长度或译文检查，未加入练习；请重试。');}
  requireValue(!content.paragraphs(plan.id).some(prior=>prior.id===entry.id),'生成内容与已有段落重复，请换一个情境。',502,'paragraph_duplicate');
  return entry;
}

export class ParagraphGeneration {
  constructor(store,content,learning,provider=new RuleParagraphProvider()){
    this.store=store;this.content=content;this.learning=learning;this.provider=provider;this.pending=new Map();
    content.runtimeParagraphs=new Map();content.runtimeGenerationEnabled=provider.info().available;this.install();
  }
  install(){for(const [id,language] of Object.entries(this.store.state.languages))this.content.runtimeParagraphs.set(id,Object.values(language.generatedParagraphs??{}).filter(entry=>{
    if(this.content.runtimeParagraphValid)return this.content.runtimeParagraphValid(id,entry);
    try{validateParagraphPack({schemaVersion:1,languageId:id,version:'runtime',entries:[entry]},id,this.content.eligible(id,2));return entry.runtimeGenerated===true;}catch{return false;}
  }));}
  async ensure(view){return view.purpose==='recent-paragraphs'&&!view.task?this.generate(view.sessionId,null):view;}
  async generate(sessionId,expectedTaskId){
    const session=this.store.state.sessions[sessionId];requireValue(session?.purpose==='recent-paragraphs','请先进入近期词小段落。',400,'paragraph_session_required');
    requireValue(this.store.state.activeSessions[`${session.languageId}:recent-paragraphs`]===sessionId,'小段落会话已更换。',409,'session_conflict');
    if((session.task?.id??null)!==expectedTaskId)return this.learning.get(sessionId);
    if(this.pending.has(sessionId))return this.pending.get(sessionId);
    const operation=this.run(sessionId,expectedTaskId);this.pending.set(sessionId,operation);
    try{return await operation;}finally{this.pending.delete(sessionId);}
  }
  async run(sessionId,expectedTaskId){
    const original=this.store.state.sessions[sessionId],id=original.languageId;
    let plan=paragraphPlan(this.content,this.store.state,id,this.learning.clock());
    if(!plan)return{...await this.learning.get(sessionId),generation:{status:'insufficient-evidence',message:'先积累至少两个词的词义回忆记录，再来生成小段落。'}};
    try{
      plan=this.provider.preparePlan?.(plan)??plan;
    const output=await this.provider.generate(plan),entry=generatedParagraph(output,plan,this.content,this.learning.clock(),this.provider.info().model,this.provider.info().provider);
      return await this.store.transaction(state=>{
        const session=state.sessions[sessionId];
        if((session.task?.id??null)!==expectedTaskId)return this.learning.view(state,session,this.learning.clock());
        const language=state.languages[id];language.generatedParagraphs??={};entry.rank=Object.keys(language.generatedParagraphs).length+1;
        language.generatedParagraphs[entry.id]=entry;this.content.runtimeParagraphs.set(id,Object.values(language.generatedParagraphs));
        this.learning.setTask(state,session,entry,'recent-paragraphs');
        return{...this.learning.view(state,session,this.learning.clock()),generation:{status:'ready',provider:this.provider.info().provider,...(plan.ruleCoverage?{coverage:plan.ruleCoverage}:{})}};
      });
    }catch(error){
      this.install();
      if(!this.store.state.sessions[sessionId].task)await this.store.transaction(state=>{
        const session=state.sessions[sessionId],enabled=this.content.runtimeGenerationEnabled;
        try{this.content.runtimeGenerationEnabled=false;if(!session.task)this.learning.choose(state,session,this.learning.clock());}
        finally{this.content.runtimeGenerationEnabled=enabled;}return null;
      });
      return{...await this.learning.get(sessionId),generation:{status:'unavailable',message:error instanceof HttpError?error.message:'暂时未能生成新段落；已有内容仍可学习，请重试。'},
        suggestedTargets:(plan.evidence??plan.candidates).filter(row=>row.weak||row.recent).sort((a,b)=>b.priority-a.priority).slice(0,3).map(row=>({entryId:row.entryId,display:row.word.display,reason:row.weak?'reinforce':'recent'}))};
    }
  }
}
