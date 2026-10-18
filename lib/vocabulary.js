import { createHash, randomInt, randomUUID } from '../crypto.js';
export const VOCABULARY_VERSION = 'vocabulary-sample-v1';
const meaningReview = r => r.assessedSkill === 'word-meaning' || (r.stage === 2 && !r.assessedSkill);
export function vocabularyEntries(entries) {
  return entries.filter(e => Object.values(e.meanings ?? {}).some(v => typeof v === 'string' && v.trim()));
}
export function coverageFingerprint(entries) {
  return createHash('sha256').update(JSON.stringify(entries.map(e => [e.id, e.display, e.meanings]).sort((a, b) => a[0].localeCompare(b[0])))).digest('hex');
}
export function recalledEntries(reviews) {
  const latest = new Map();
  for (const r of reviews ?? []) if (meaningReview(r) && typeof r.entryId === 'string' && [1,2,3,4].includes(r.rating)) latest.set(r.entryId, r.rating);
  return latest;
}
export function ensureSurvey(language, entries) {
  entries = vocabularyEntries(entries);
  const fingerprint = coverageFingerprint(entries);
  const prior = language.vocabularySurvey;
  if (prior?.coverageFingerprint === fingerprint) {
    const samples = surveySamples(language.reviews, prior);
    if (samples.size < prior.drawIds.length || !prior.drawIds.length) return prior;
    prior.completedAtReviewCount ??= language.reviews.length;
    if (language.reviews.length - prior.completedAtReviewCount < 20) return prior;
    language.previousVocabularySurvey = structuredClone(prior);
  }
  const assessed = recalledEntries(language.reviews);
  const frame = entries.filter(e => !assessed.has(e.id) && !language.cards[`2:${e.id}`]).map(e => e.id);
  const shuffled = [...frame];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = randomInt(i + 1); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  // Reserve a uniformly chosen set before ordinary teaching can select them.
  const drawIds = shuffled.slice(0, (shuffled.length < 6 ? 0 : Math.min(24, Math.max(6, Math.floor(shuffled.length * .2)), shuffled.length)));
  return language.vocabularySurvey = { version: VOCABULARY_VERSION, id: randomUUID(), coverageFingerprint: fingerprint,
    frameIds: frame, drawIds, startedReviewCount: language.reviews.length, method: 'uniform-without-replacement-reserved', sampleSize: drawIds.length };
}
export function surveySamples(reviews, survey) {
  const samples = new Map();
  if (!survey) return samples;
  for (const r of reviews ?? []) {
    const m = r.vocabularyMeasurement;
    if (m?.surveyId === survey.id && m?.coverageFingerprint === survey.coverageFingerprint && m?.method === survey.method && meaningReview(r) && survey.frameIds.includes(r.entryId) && !samples.has(r.entryId)) samples.set(r.entryId, r.rating >= 3);
    // The membership was randomly fixed; later real meaning recalls can update
    // those same words without increasing sample size or rewriting the log.
    else if (samples.has(r.entryId) && meaningReview(r) && [1,2,3,4].includes(r.rating)) samples.set(r.entryId, r.rating >= 3);
  }
  return samples;
}
export function reservedEntries(language, survey) {
  const measured = surveySamples(language.reviews, survey);
  return survey.drawIds.filter(id => !measured.has(id));
}
export function surveyChoice(language, entries, survey, exhausted = false) {
  const measured = surveySamples(language.reviews, survey);
  const after = language.reviews.slice(survey.startedReviewCount).filter(r => !r.vocabularyMeasurement && !r.cardWasReview && [2,3].includes(r.stage));
  // One probe after four ordinary new tasks. Due cards always take precedence.
  if (!exhausted && after.length < 4 * (measured.size + 1)) return null;
  const id = reservedEntries(language, survey)[0], entry = entries.find(e => e.id === id);
  return entry ? { entry, selectionReason: 'vocabulary-sample', measurement: {
    version: VOCABULARY_VERSION, surveyId: survey.id, coverageFingerprint: survey.coverageFingerprint,
    method: survey.method, frameSize: survey.frameIds.length, sampleSize: survey.sampleSize,
    inclusionProbability: survey.sampleSize / survey.frameIds.length, drawIndex: measured.size,
    assessedSkill: 'word-meaning', responseKind: 'pre-reveal-self-rating'
  } } : null;
}
// Wilson interval is a deliberately broad reference, not calibrated test confidence.
export function referenceInterval(successes, count) {
  const z = 1.96, p = successes / count, d = 1 + z*z/count;
  const center = (p + z*z/(2*count))/d, half = z*Math.sqrt(p*(1-p)/count + z*z/(4*count*count))/d;
  return [Math.max(0,center-half), Math.min(1,center+half)];
}
export function estimateVocabulary(language, allEntries) {
  const entries = vocabularyEntries(allEntries), ids = new Set(entries.map(e => e.id));
  const ratings = recalledEntries(language?.reviews);
  const recalled = [...ratings].filter(([id,rating]) => ids.has(id) && rating >= 3).length;
  const assessed = [...ratings.keys()].filter(id => ids.has(id)).length;
  let survey = language?.vocabularySurvey;
  const currentMatches = survey?.coverageFingerprint === coverageFingerprint(entries);
  const currentSamples = currentMatches ? surveySamples(language.reviews, survey).size : 0;
  let refreshing = false;
  if (currentMatches && currentSamples < Math.min(6,survey.frameIds.length) && language.previousVocabularySurvey?.coverageFingerprint === survey.coverageFingerprint) { survey = language.previousVocabularySurvey; refreshing = true; }
  const matches = survey?.version === VOCABULARY_VERSION && survey.coverageFingerprint === coverageFingerprint(entries);
  const samples = matches ? surveySamples(language.reviews, survey) : new Map();
  const n = samples.size, N = matches ? survey.frameIds.length : 0, successes = [...samples.values()].filter(Boolean).length;
  const base = { modelVersion: VOCABULARY_VERSION, scope: 'current-course-entries', unit: 'word-entry', coverageCount: entries.length,
    recalledCount: recalled, assessedCount: assessed, sampleCount: n, requiredSamples: Math.min(6,N || 6), estimated: true,
    method: 'reserved uniform word-meaning self-ratings; broad reference interval; not a validated vocabulary test',
    refreshing, refreshSampleCount: refreshing ? currentSamples : 0,
    status: 'insufficient-evidence', estimate: null, lower: null, upper: null, atCoverageLimit: false };
  if (entries.length > 0 && assessed === entries.length) return { ...base, status: 'tentative', estimate: recalled, lower: recalled, upper: recalled, atCoverageLimit: recalled === entries.length, method: 'all current course entries have direct word-meaning self-ratings; not a global vocabulary test' };
  if (!matches || !n || (n < 6 && n < N)) return base;
  const frame = new Set(survey.frameIds);
  const knownOutside = [...ratings].filter(([id,r]) => ids.has(id) && !frame.has(id) && r >= 3).length;
  const bounds = n === N ? [successes/n,successes/n] : referenceInterval(successes,n);
  const lower = Math.max(recalled, Math.floor(knownOutside + bounds[0]*N));
  const upper = Math.min(entries.length, Math.max(lower, Math.ceil(knownOutside + bounds[1]*N)));
  const raw = Math.max(lower, Math.min(upper, knownOutside + successes/n*N));
  const quantum = entries.length >= 100 ? 10 : 1;
  const estimate = Math.max(lower, Math.min(upper, Math.round(raw/quantum)*quantum));
  return { ...base, status: 'tentative', estimate, lower, upper, atCoverageLimit: estimate === entries.length };
}
