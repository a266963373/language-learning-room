import { HttpError } from './errors.js';
import { RULE_VERSION, RULE_LANGUAGES, ruleDerivations, renderRule, ruleLexemes, ruleOccurrence } from './paragraph-rule-grammar.js';

export class RuleParagraphProvider {
  info(){return{available:true,provider:'rules',model:RULE_VERSION,local:true,requiresApiKey:false,network:false,costPerGeneration:0};}
  preparePlan(plan){
    const supported=ruleLexemes(plan.id,plan.evidence??plan.candidates).sort((a,b)=>b.priority-a.priority);
    if(supported.length<2)throw new HttpError(409,'paragraph_rule_coverage','目前的规则还不能自然地串起至少两个已练过的词。请继续普通词义复习；不会调用在线模型或收费。');
    const used=new Set(plan.usedTexts??plan.avoid),known=plan.known.map(word=>word.toLocaleLowerCase(plan.id));
    let best=null,matching=0,remaining=0;
    const recentScenes=plan.recentRuleScenes??[];
    for(const derivation of ruleDerivations(plan.tier)){
      const sentences=renderRule(derivation,plan.id),text=sentences.join(' ');
      const matches=supported.map(row=>({...row,surface:ruleOccurrence(plan.id,row.rule,text)})).filter(row=>row.surface);
      if(matches.length<2)continue;matching++;
      if(used.has(text))continue;remaining++;
      const chosen=new Map();
      const weak=matches.find(row=>row.weak),recent=matches.find(row=>row.recent&&row.entryId!==weak?.entryId);
      for(const row of [weak,recent,...matches])if(row&&chosen.size<2)chosen.set(row.entryId,row);
      const targets=[...chosen.values()];
      const lower=text.toLocaleLowerCase(plan.id);
      const familiarity=known.reduce((sum,word)=>sum+(lower.includes(word)?1:0),0);
      const score=targets.reduce((sum,row)=>sum+row.priority,0)+(targets.some(row=>row.weak)?45:0)+(targets.some(row=>row.recent)?30:0)
        +Math.min(8,familiarity)*.5-recentScenes.filter(scene=>scene===derivation.scene).length*4-text.length*(plan.tier===1?.025:.008);
      // Canonical enumeration is the deterministic tie-breaker, so refreshes
      // and retries never depend on a random or clock-based novelty counter.
      if(!best||score>best.score)best={score,derivation,sentences,targets};
    }
    if(!best)throw new HttpError(409,matching?'paragraph_rules_exhausted':'paragraph_rule_coverage',matching
      ?'当前词汇和难度下的规则组合已练完，可以复习已有段落，或学些新词后再来；不会重复冒充新内容。'
      :'当前词汇暂时不能组成自然连贯的规则段落。请继续普通复习；不会硬塞不相干的词。');
    const meanings=Object.fromEntries(RULE_LANGUAGES.filter(id=>id!==plan.id).map(id=>[id,renderRule(best.derivation,id).join(' ')]));
    return{...plan,candidates:best.targets,requireWeak:best.targets.some(row=>row.weak),requireRecent:best.targets.some(row=>row.recent),
      ruleOutput:{title:best.derivation.scene,sentences:best.sentences,meanings,derivation:best.derivation,
        targets:best.targets.map(row=>({entryId:row.entryId,surface:row.surface,senseNote:'受控情境规则绑定当前所教义项和词形'}))},
      ruleCoverage:{supportedWords:supported.length,reviewedWords:(plan.evidence??plan.candidates).length,matchingCombinations:matching,unusedCombinations:remaining}};
  }
  async generate(plan){return plan.ruleOutput??this.preparePlan(plan).ruleOutput;}
}
