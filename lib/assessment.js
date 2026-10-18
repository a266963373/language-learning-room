import {createHash,randomInt,randomUUID} from '../crypto.js';
export const ASSESSMENT_VERSION='vocabulary-stratified-v2';
export function validateAssessment(pack,id) {
 if(pack?.schemaVersion!==1||pack.languageId!==id||!Array.isArray(pack.bands)||!pack.bands.length||!Array.isArray(pack.sources)||pack.population?.unit!=='qualified-independent-word-form')throw new Error('Invalid vocabulary assessment framework');
 const ids=new Set(),forms=new Set(),canonical=new Set(),bands=new Set();let lastMax=0;
 for(const band of pack.bands){
  if(typeof band.id!=='string'||bands.has(band.id)||!Number.isInteger(band.populationCount)||band.populationCount<=0||!Array.isArray(band.entries)||band.entries.length<4||band.populationCount<band.entries.length||!Number.isInteger(band.minRank)||!Number.isInteger(band.maxRank)||band.minRank<=lastMax||band.maxRank<band.minRank)throw new Error('Invalid assessment stratum population');
  if(band.sampleCount!==undefined&&band.sampleCount!==band.entries.length)throw new Error('Assessment sample count mismatch');
  if(band.samplingProbability!==undefined&&(!Number.isFinite(band.samplingProbability)||Math.abs(band.samplingProbability-band.entries.length/band.populationCount)>1e-12))throw new Error('Assessment source inclusion probability mismatch');
  bands.add(band.id);lastMax=band.maxRank;
  for(const e of band.entries){const form=e.display?.normalize('NFC');if(typeof e.id!=='string'||!e.id.startsWith(`${id}:assessment:`)||ids.has(e.id)||!form||forms.has(form)||!Number.isInteger(e.rank)||e.rank<band.minRank||e.rank>band.maxRank||!Object.values(e.meanings??{}).some(v=>typeof v==='string'&&v.trim()))throw new Error('Invalid assessment word form');if(typeof e.canonicalTeachingEntryId!=='string'||!e.canonicalTeachingEntryId.startsWith(`${id}:`)||canonical.has(e.canonicalTeachingEntryId))throw new Error('Invalid canonical assessment identity');ids.add(e.id);forms.add(form);canonical.add(e.canonicalTeachingEntryId);}
 }
 if(pack.population.populationCount!==undefined&&pack.population.populationCount!==pack.bands.reduce((n,b)=>n+b.populationCount,0))throw new Error('Assessment population count mismatch');
 if(pack.population.canonicalEntryIds!==undefined&&(!Array.isArray(pack.population.canonicalEntryIds)||pack.population.canonicalEntryIds.length!==pack.bands.reduce((n,b)=>n+b.populationCount,0)||new Set(pack.population.canonicalEntryIds).size!==pack.population.canonicalEntryIds.length||pack.population.canonicalEntryIds.some(x=>typeof x!=='string'||!x.startsWith(`${id}:`))))throw new Error('Invalid qualified frame identities');
 if(pack.population.canonicalEntryIds&&[...canonical].some(id=>!pack.population.canonicalEntryIds.includes(id)))throw new Error('Assessment sample lies outside qualified frame');
 return pack;
}
export const assessmentEntries=pack=>pack?.bands?.flatMap(b=>b.entries)??[];
export function assessmentFingerprint(pack){return createHash('sha256').update(JSON.stringify([pack.version,pack.population,pack.bands.map(b=>[b.id,b.populationCount,b.minRank,b.maxRank,b.entries.map(e=>[e.id,e.display,e.meanings])])])).digest('hex');}
const isMeaning=r=>r.assessedSkill==='word-meaning'||(r.stage===2&&!r.assessedSkill);
export function assessmentSamples(reviews,plan){const result=new Map();if(!plan)return result;for(const r of reviews??[]){const m=r.vocabularyMeasurement;if(isMeaning(r)&&[1,2,3,4].includes(r.rating)&&m?.version===ASSESSMENT_VERSION&&m.planId===plan.id&&m.frameFingerprint===plan.frameFingerprint&&plan.draws.some(d=>d.entryId===r.entryId&&d.bandId===m.bandId)&&!result.has(r.entryId))result.set(r.entryId,r.rating===1?0:r.rating===2?.5:1);}return result;}
// Pure completion boundary: the last distinct first measurement, not a later GET/choice.
export function assessmentCompletionCount(reviews,plan){
 if(!plan?.draws.length)return null;const seen=new Set();
 for(let i=0;i<(reviews??[]).length;i++){const r=reviews[i],m=r.vocabularyMeasurement;
  if(isMeaning(r)&&[1,2,3,4].includes(r.rating)&&m?.version===ASSESSMENT_VERSION&&m.planId===plan.id&&m.frameFingerprint===plan.frameFingerprint&&plan.draws.some(d=>d.entryId===r.entryId&&d.bandId===m.bandId)&&!seen.has(r.entryId)){
   seen.add(r.entryId);if(seen.size===plan.draws.length)return i+1;
  }
 }return null;
}
export function ensureAssessment(language,pack){
 const fingerprint=assessmentFingerprint(pack),prior=language.vocabularyAssessment;
 if(prior?.frameFingerprint===fingerprint){const n=assessmentSamples(language.reviews,prior).size;if(n<prior.draws.length||prior.exhausted)return prior;prior.completedAtReviewCount=assessmentCompletionCount(language.reviews,prior);if(prior.completedAtReviewCount===null)return prior;if(language.reviews.length-prior.completedAtReviewCount<20)return prior;language.previousVocabularyAssessment=structuredClone(prior);}
 const used=new Set((language.reviews??[]).filter(r=>isMeaning(r)&&[1,2,3,4].includes(r.rating)&&r.vocabularyMeasurement?.version===ASSESSMENT_VERSION).map(r=>r.entryId));
 const draws=[],perBand=new Map();for(const band of pack.bands){const pool=band.entries.filter(e=>!used.has(e.id));for(let i=pool.length-1;i>0;i--){const j=randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}perBand.set(band.id,pool.slice(0,6));}
 // First pass covers every qualified frequency band, subsequent passes refine it.
 for(let round=0;round<6;round++)for(const band of pack.bands){const e=perBand.get(band.id)[round];if(e)draws.push({entryId:e.id,bandId:band.id,populationCount:band.populationCount,poolSize:band.entries.length,selectedSize:perBand.get(band.id).length});}
 const exhausted=pack.bands.some(b=>!perBand.get(b.id).length);
 return language.vocabularyAssessment={version:ASSESSMENT_VERSION,id:randomUUID(),frameFingerprint:fingerprint,draws:exhausted?[]:draws,startedReviewCount:language.reviews.length,exhausted,method:'source-uniform-pool-then-uniform-without-replacement'};
}
export function assessmentChoice(language,pack,plan,force=false){
 if(plan.exhausted)return null;const samples=assessmentSamples(language.reviews,plan),n=samples.size;
 const recent=language.reviews.slice(plan.startedReviewCount);
 let lastMeasurement=-1;for(let i=0;i<recent.length;i++)if(recent[i].vocabularyMeasurement?.version===ASSESSMENT_VERSION)lastMeasurement=i;
 const ordinary=recent.slice(lastMeasurement+1).filter(r=>!r.vocabularyMeasurement&&!r.cardWasReview&&[2,3].includes(r.stage)&&r.sessionPurpose!=='assessment').length;
 const required=n<12?2:4;
 if(!force&&ordinary<required)return null;
 const draw=plan.draws.find(d=>!samples.has(d.entryId));if(!draw)return null;
 const entry=assessmentEntries(pack).find(e=>e.id===draw.entryId);if(!entry)return null;
 return {entry,selectionReason:'vocabulary-assessment',practiceStage:2,measurement:{version:ASSESSMENT_VERSION,planId:plan.id,frameFingerprint:plan.frameFingerprint,bandId:draw.bandId,method:plan.method,populationCount:draw.populationCount,poolSize:draw.poolSize,selectedSize:draw.selectedSize,sourceInclusionProbability:draw.poolSize/draw.populationCount,withinPoolInclusionProbability:draw.selectedSize/draw.poolSize,inclusionProbability:draw.selectedSize/draw.populationCount,drawIndex:n,responseKind:'first-pre-reveal-word-meaning-self-rating'}};
}
function interval(successes,n){if(!n)return[0,1];const z=1.96,p=successes/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return[Math.max(0,c-h),Math.min(1,c+h)];}
export function estimateAssessment(language,pack){
 const fingerprint=assessmentFingerprint(pack),current=language?.vocabularyAssessment;
 let plan=current?.frameFingerprint===fingerprint?current:null;const currentSamples=assessmentSamples(language?.reviews,plan);
 let refreshing=false;if(plan&&(plan.exhausted||currentSamples.size<pack.bands.length)&&language.previousVocabularyAssessment?.frameFingerprint===fingerprint){plan=language.previousVocabularyAssessment;refreshing=true;}
 const samples=assessmentSamples(language?.reviews,plan);let raw=0,low=0,high=0;const detail=pack.bands.map(b=>{const draws=plan?.draws.filter(d=>d.bandId===b.id)??[],responses=draws.filter(d=>samples.has(d.entryId)).map(d=>samples.get(d.entryId)),n=responses.length,k=responses.reduce((a,v)=>a+v,0);const[lo,hi]=interval(k,n);low+=lo*b.populationCount;high+=hi*b.populationCount;if(n)raw+=k/n*b.populationCount;return{id:b.id,minRank:b.minRank,maxRank:b.maxRank,populationCount:b.populationCount,sampleCount:n,recognized:k};});
 const covered=detail.filter(b=>b.sampleCount>0).length,populationCount=detail.reduce((a,b)=>a+b.populationCount,0),hasEstimate=covered===detail.length;
 const latest=new Map();for(const r of language?.reviews??[])if(isMeaning(r)&&[1,2,3,4].includes(r.rating))latest.set(r.canonicalEntryId??r.entryId,r.rating);
 const membership=new Set(pack.population.canonicalEntryIds??[]),directKnownWithinFrame=[...latest].filter(([id,r])=>membership.has(id)&&r>=3).length;
 const quantum=populationCount>=1000?100:10,lower=Math.max(directKnownWithinFrame,Math.floor(low/quantum)*quantum),upper=Math.min(populationCount,Math.max(lower,Math.ceil(high/quantum)*quantum));
 const coarseLow=Math.ceil(lower/quantum)*quantum,coarseHigh=Math.floor(upper/quantum)*quantum;
 const estimate=hasEstimate?(coarseLow<=coarseHigh?Math.max(coarseLow,Math.min(coarseHigh,Math.round(Math.max(raw,directKnownWithinFrame)/quantum)*quantum)):Math.max(lower,Math.min(upper,Math.round(raw)))):null;
 const stable=hasEstimate&&samples.size>=24&&detail.every(b=>b.sampleCount>=4)&&(upper-lower)/Math.max(estimate,100)<=.5;
 const completion=current?.frameFingerprint===fingerprint?assessmentCompletionCount(language?.reviews,current):null;
 const nextRoundReady=completion!==null&&!current.exhausted&&(language.reviews.length-completion>=20);
 const status=!hasEstimate?'insufficient-evidence':stable?'stabilizing':samples.size<12?'rough':'calibrating';
 return{modelVersion:ASSESSMENT_VERSION,scope:'source-qualified-common-word-forms',unit:'qualified-independent-word-form',frameworkId:pack.population.id??pack.framework?.id??pack.version,frameworkDescription:pack.population.description??pack.framework?.description??'',frameFingerprint:fingerprint,populationCount,coverageCount:populationCount,estimate,lower,upper,status,sampleCount:samples.size,coveredBands:covered,bandCount:detail.length,requiredSamples:detail.length,targetSamples:plan?.draws.length||36,roundSampleCount:currentSamples.size,refreshing,needsNewItems:Boolean(current?.exhausted),atFrameworkLimit:hasEstimate&&detail.every(b=>b.recognized/b.sampleCount>=.9),nextRoundReady,roundComplete:Boolean(current?.draws.length&&currentSamples.size>=current.draws.length),directKnownWithinFrame,bands:detail,recalledCount:[...latest.values()].filter(r=>r>=3).length,assessment:'self',method:'stratified first pre-reveal self-ratings; broad reference, not a calibrated test; first results frozen',sourceCoverage:pack.population.sourceCoverage??null};
}
