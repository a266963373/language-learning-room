// A deterministic self-rating policy, not a proficiency test or an FSRS replacement.
export const MODEL_VERSION = 'adaptive-v1.1';
const clamp = (n, lo = 1, hi = 5) => Math.min(hi, Math.max(lo, n));
const round = n => Math.round(n * 100) / 100;
export function difficultyLabel(score) {
  return ['起步', '基础', '日常', '进阶', '挑战'][Math.min(4, Math.max(0, Math.round(score) - 1))];
}
function validScore(value) { return Number.isFinite(value) && value >= 1 && value <= 5; }
function contextLoad(text) {
  const words = (text ?? '').trim().split(/\s+/u).filter(Boolean).length;
  const ideographs = [...(text ?? '')].filter(c => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c)).length;
  const units = Math.max(words, ideographs / 2);
  const clauses = ((text ?? '').match(/[,;:，；：]|\b(?:although|because|unless|while|if|that)\b/gi) ?? []).length;
  return clamp((units - 3) / 10 + clauses * 0.18, 0, 2.8);
}
export function trainingDifficulty(entry, stage) {
  const annotated = entry?.trainingDifficulty?.[String(stage)];
  if (validScore(annotated?.score) && typeof annotated.basis === 'string' && annotated.basis.trim()) {
    return { score: round(annotated.score), label: difficultyLabel(annotated.score), basis: `content: ${annotated.basis}` };
  }
  // Word frequency is a weak, logarithmic prior only. Rank is a fallback, never a linear skill scale.
  const hasFrequency = Number.isFinite(entry?.frequency) && entry.frequency > 0 && entry.frequency <= 1;
  const lexical = hasFrequency ? 1 + clamp((-Math.log10(entry.frequency) - 1.5) * 0.6, 0, 3.5)
    : 1 + clamp(Math.log10(Math.max(1, entry?.rank ?? 10)) / 2, 0, 3);
  let score = lexical;
  if (stage === 1) score += clamp(([...(entry?.speechText ?? entry?.display ?? '')].length - 5) / 18, 0, 0.6);
  if (stage === 3) score = 1 + (lexical - 1) * 0.5 + contextLoad(entry?.sentence?.text);
  if (stage === 4) score = 1.2 + (lexical - 1) * 0.5 + Math.max(...(entry?.output?.references ?? ['']).map(contextLoad), 0);
  score = round(clamp(score));
  return { score, label: difficultyLabel(score), basis: `heuristic: ${hasFrequency ? 'log-frequency' : 'log-rank fallback'}${stage === 1 ? ' + speech length' : stage >= 3 ? ' + context length/clauses' : ''}; not calibrated proficiency` };
}
export function adaptiveEvidence(reviews, entries, stage) {
  const known = new Map(entries.map(e => [e.id, e])), unique = new Map();
  for (const r of reviews ?? []) {
    if ((r.assessedSkill === 'word-meaning' && r.stage !== 2) || r.stage !== stage || !Number.isInteger(r.rating) || r.rating < 1 || r.rating > 4 || typeof r.entryId !== 'string') continue;
    const prior = unique.get(r.entryId);
    const difficulty = validScore(r.difficulty?.score) ? r.difficulty : trainingDifficulty(known.get(r.entryId), stage);
    const weak = !validScore(r.difficulty?.score) || typeof r.difficulty?.basis !== 'string' || !r.difficulty.basis.startsWith('content:') || r.difficulty.basis.includes('heuristic personalized');
    const currentRound = validScore(r.difficulty?.score) && r.adaptiveModelVersion === MODEL_VERSION;
    // A repeated identical rating is not new evidence and cannot change its recency.
    // A real later difficulty snapshot can replace a weak historical approximation.
    if (prior?.rating === r.rating) {
      if (validScore(r.difficulty?.score)) { prior.difficulty = difficulty.score; prior.weak = weak; prior.currentRound ||= currentRound; }
      continue;
    }
    unique.delete(r.entryId);
    unique.set(r.entryId, { entryId: r.entryId, rating: r.rating, difficulty: difficulty.score, weak, currentRound });
  }
  return [...unique.values()];
}
export function estimateAdaptive(reviews, entries, stage) {
  const evidence = adaptiveEvidence(reviews, entries, stage);
  let score = 1.25;
  for (const r of evidence) {
    if (r.rating === 4) {
      const gain = 0.35 + 0.15 * clamp(r.difficulty - score, -1, 1);
      score = Math.min(score + gain, Math.max(score, r.difficulty + 0.85));
    } else if (r.rating === 1) score -= r.difficulty > score + 0.75 ? 0.4 : 0.65;
    else if (r.rating === 2) score -= 0.3;
    else score += 0.08 * clamp(r.difficulty - score, -1, 1);
    score = clamp(score);
  }
  score = round(score);
  const difficulties = entries.map(e => trainingDifficulty(e, stage).score);
  const availableMaxDifficulty = difficulties.length ? Math.max(...difficulties) : null;
  const supporting = evidence.filter(r => r.rating >= 3 && r.difficulty >= score - 0.75 && !r.weak);
  const distinctBands = new Set(supporting.map(r => Math.round(r.difficulty * 2)));
  const testedMax = Math.max(1, ...evidence.filter(r => r.rating >= 3 && !r.weak).map(r => r.difficulty));
  const probing = evidence.length < 6 || supporting.length < 3 || distinctBands.size < 2 || score > testedMax + 0.35;
  const nearby = difficulties.filter(d => Math.abs(d - score) <= 0.65).length;
  return { stage, score, minScore: 1, maxScore: 5, label: difficultyLabel(score), evidenceCount: evidence.length,
    confidenceLabel: probing ? '正在试探' : '初步自评依据', estimated: true, basis: 'self-rating', probing,
    contentLimited: entries.length < 12 || availableMaxDifficulty === null || availableMaxDifficulty < score + 0.35 || nearby < 3,
    targetDifficulty: score, availableMaxDifficulty, modelVersion: MODEL_VERSION };
}
const byFrequency = (a, b) => a.entry.rank - b.entry.rank || a.entry.id.localeCompare(b.entry.id);
function nearHighestValue(pool, target) {
  if (!pool.length) return null;
  const nearest = Math.min(...pool.map(e => Math.abs(e.difficulty - target)));
  return pool.filter(e => Math.abs(e.difficulty - target) <= Math.max(0.6, nearest + 0.15)).sort(byFrequency)[0];
}
export function selectAdaptiveNew(entries, cards, reviews, stage) {
  const model = estimateAdaptive(reviews, entries, stage), evidence = adaptiveEvidence(reviews, entries, stage);
  const candidates = entries.filter(e => !cards[`${stage}:${e.id}`]).map(entry => ({ entry, difficulty: trainingDifficulty(entry, stage).score }));
  if (!candidates.length) return null;
  const target = model.targetDifficulty;
  // Old inferred history must never make the first upgraded choice a basic gap.
  // Six-question cadence counts distinct entries with real snapshots recorded by
  // this selection policy, including heuristic snapshots, independently of confidence.
  const freshCount = evidence.filter(r => r.currentRound).length;
  if (freshCount >= 5 && freshCount % 6 === 5) {
    const gap = candidates.filter(e => e.difficulty < target - 0.55).sort(byFrequency)[0];
    if (gap) return { entry: gap.entry, selectionReason: 'gap-check' };
  }
  if (evidence.length >= 3 && evidence.slice(-3).every(r => r.rating === 4)) {
    const harder = candidates.filter(e => e.difficulty >= target + 0.2 && e.difficulty <= target + 0.8);
    const probe = harder.sort(byFrequency)[0];
    if (probe) return { entry: probe.entry, selectionReason: 'level-probe' };
  }
  const next = nearHighestValue(candidates, target);
  return { entry: next.entry, selectionReason: next.difficulty > target + 0.6 ? 'level-probe' : 'high-frequency' };
}
