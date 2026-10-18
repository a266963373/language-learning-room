export const DEFAULT_HELPER_PAIRS = {
  en: ['zh', 'ja'], ja: ['en', 'zh'], ko: ['ja', 'zh'],
  es: ['en', 'ja'], fr: ['es', 'en'], ru: ['en', 'ja'], ar: ['en', 'ja'],
  id: ['es', 'en'], hi: ['es', 'en']
};
export const HELPER_POLICY = 'es-en-starter-2026-10-05';

export function helperLanguages(preferences, languageId) {
  const pair = preferences?.helperPairs?.[languageId];
  return Array.isArray(pair) ? [...pair] : [...(DEFAULT_HELPER_PAIRS[languageId] || ['en', 'ja'])];
}

export function helperTranslations(values, languages) {
  return languages.map(language => ({ language,
    text: typeof values?.[language] === 'string' ? values[language] : '',
    missing: typeof values?.[language] !== 'string' || !values[language].trim()
  }));
}

export function initializeHelperPreferences(state) {
  let changed = false;
  if (!state.preferences.helperPairs) {
    state.preferences.helperPairs = structuredClone(DEFAULT_HELPER_PAIRS);
    state.preferences.helpers = Object.fromEntries(Object.entries(DEFAULT_HELPER_PAIRS).map(([id, pair]) => [id, pair[0]]));
    changed = true;
  }
  for (const [id, pair] of Object.entries(DEFAULT_HELPER_PAIRS)) {
    if (!state.preferences.helperPairs[id]) {
      state.preferences.helperPairs[id] = [...pair];
      state.preferences.helpers[id] = pair[0];
      changed = true;
    }
  }
  // Apply this user's requested French pairing once; later settings remain editable.
  if (state.preferences.helperPairPolicy !== HELPER_POLICY) {
    state.preferences.helperPairs.fr = [...DEFAULT_HELPER_PAIRS.fr];
    state.preferences.helpers.fr = 'es';
    state.preferences.helperPairPolicy = HELPER_POLICY;
    changed = true;
  }
  return changed;
}
