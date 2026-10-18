import { languageNames, shortcutAction, translation, progressValues, vocabularyValues, assessmentCanStart, escapeHTML as esc, sentenceParts, request } from './core.js';
import { helperLanguages, helperTranslations } from './helper-languages.js';
import { japaneseMarkup } from './japanese-readings.js';
import { hindiTransliteration } from './hindi-transliteration.js';
import './travel-transfer.js';
import { arabicDisplay } from './arabic-vowels.js';
import { arabicTransliteration } from './arabic-transliteration.js';

const $ = selector => document.querySelector(selector);
const strings = {
  en: { stages: ['Sound', 'Vocabulary', 'Input', 'Output'], settings: 'Settings & content', help: 'Keys & help', today: 'Today', growth: 'Growth', level: 'Level', xp: 'XP', footer: 'A little, every day.', loading: 'Opening your place…', reveal: 'Reveal', ratings: ['Again', 'Hard', 'Good', 'Easy'], shortcut: 'Space · reveal     1–4 · rate', play: 'Play audio', playing: 'Playing…', played: 'Audio played', audioMissing: 'No audio available for this item.', audioBlocked: 'Press play to hear the audio.', audioFailed: 'Audio unavailable. Press play to retry.', helper: 'Helper language', ui: 'Interface language', dailyGoal: 'Daily goal', save: 'Save settings', saving: 'Saving…', saved: 'Settings saved.', choices: 'Listen & choose', spelling: 'Recall spelling', listenFirst: 'Listen first', together: 'Text + audio', choose: 'Choose what you heard.', recall: 'Recall the spelling in your mind.', meaning: 'Recall the meaning.', understand: 'Understand the sentence.', response: 'Your response', responsePlaceholder: 'Write your response here…', record: 'Record', stop: 'Stop recording', recording: 'Recording…', recorded: 'Saved locally', recordingLocal: 'Playback ready; server save failed.', recordingUnsupported: 'Recording is unavailable in this browser.', finish: 'Finish writing', reference: 'Reference · other answers may be valid', comparison: 'Compare with the reference and rate yourself.', noModel: 'Reference comparison · no automated correction', noTranslation: 'No translation available.', translationFallback: 'Shown in', correct: 'Answer', itemEmpty: 'No practice is available here yet.', retry: 'Retry', content: 'Content coverage', entries: 'Teaching words', wordAudio: 'Word audio', sentenceAudio: 'Sentence audio', version: 'Version', sources: 'Sources', noSources: 'Source details have not been returned by the service.', refresh: 'Get more content', limit: 'Target entries', running: 'Refreshing content…', complete: 'Content refresh completed.', failed: 'Content refresh failed.', lookup: 'Word details', lemma: 'Lemma', pos: 'Part of speech', forms: 'Forms', context: 'In this sentence', noContext: 'No sentence analysis available. Dictionary information only.', noDefinition: 'No dictionary meaning available.', sourceIds: 'Source IDs', quality: 'Content status', recognitionMissing: 'Choices unavailable for this item.', microphoneError: 'Microphone could not be opened.', noSession: 'Could not open a practice session.', busyRecord: 'Stop recording before leaving this item.', refreshNote: 'Downloads, dictionaries and audio are processed locally. Existing learning history is kept.', totalGrowth: 'Total experience', helpText: 'Listen or recall before revealing. Space reveals the answer; 1–4 records your own assessment: again, hard, good, easy. Rate how you did before seeing the answer. These are self-assessments, including mental spelling.', helpInput: 'Spaces and numbers remain ordinary text inside input fields. Use “Finish writing” or leave the field to use shortcuts. Holding a key does not submit twice.', helpOutput: 'Record or write, then compare with the reference. Recordings are saved only on this device. References are examples, not the only valid answers. This trial does not score pronunciation or claim automatic correction.', helpProgress: 'Today counts completed practice. Vocabulary level is an approximate self-rating estimate from broad frequency bands. Directly recalled practice words appear only in details. Sound and ordinary sentence ratings are not word-meaning measurement evidence.', unavailable: 'Unavailable', checkSpelling: 'Your spelling was a mental recall; rate it yourself.', pending: 'Saving your recording…' },
  zh: { stages: ['听辨', '词汇', '输入', '输出'], settings: '设置与内容', help: '快捷键与帮助', today: '今日任务', growth: '长期成长', level: '等级', xp: '经验', footer: '每天一点，慢慢积累。', loading: '恢复学习位置…', reveal: '揭晓', ratings: ['重来', '困难', '正常', '轻松'], shortcut: '空格 · 揭晓     1–4 · 自评', play: '播放音频', playing: '正在播放…', played: '已播放', audioMissing: '此题暂无可用音频。', audioBlocked: '点击播放以收听。', audioFailed: '音频不可用，点击播放重试。', helper: '辅助语言', ui: '界面语言', dailyGoal: '每日目标', save: '保存设置', saving: '保存中…', saved: '设置已保存。', choices: '听音选择', spelling: '脑内拼写', listenFirst: '先听后看', together: '文字与音频同显', choose: '选择你听到的文字。', recall: '在脑中回忆拼写。', meaning: '在心中回忆含义。', understand: '理解这句话。', response: '你的表达', responsePlaceholder: '在这里输入你的表达…', record: '录音', stop: '停止录音', recording: '正在录音…', recorded: '已保存到本机', recordingLocal: '可以回放，服务器保存失败。', recordingUnsupported: '此浏览器不支持录音。', finish: '完成输入', reference: '参考表达 · 其他表达也可能正确', comparison: '对照参考，然后自评。', noModel: '参考对照 · 未进行智能批改', noTranslation: '暂无可用释义。', translationFallback: '当前使用', correct: '正解', itemEmpty: '此处暂时没有可练习的内容。', retry: '重试', content: '内容覆盖', entries: '教学单词', wordAudio: '词音频', sentenceAudio: '句子音频', version: '版本', sources: '来源', noSources: '服务暂未返回来源明细。', refresh: '获取更多内容', limit: '目标词条数', running: '正在刷新内容…', complete: '内容刷新已完成。', failed: '内容刷新失败。', lookup: '词条详情', lemma: '原形', pos: '词性', forms: '词形', context: '在这句话中', noContext: '暂无句子分析，仅显示已有词典资料。', noDefinition: '暂无词典释义。', sourceIds: '来源编号', quality: '内容状态', recognitionMissing: '此题暂无听辨选项。', microphoneError: '无法打开麦克风。', noSession: '无法打开练习。', busyRecord: '请先停止录音，再离开此题。', refreshNote: '在本机运行下载、查词和音频流程，保留已有学习历史。', totalGrowth: '累计经验', helpText: '先听或回忆，再揭晓。空格揭晓；1–4分别记录重来、困难、正常、轻松。以揭晓之前的表现自评。脑内拼写也是自评，不是客观拼写测试。', helpInput: '输入框内的空格和数字正常输入。点击“完成输入”或离开输入框后使用快捷键。长按按键不会重复提交。', helpOutput: '录音或写作后，对照参考表达。录音保存在本机。参考并非唯一正确答案；试用版不评分发音、不冒充自动批改。', helpProgress: '今日任务显示完成量。词汇水平是跨频段词义自评得到的近似估计，已经练过的词义回忆数仅放在详情。听辨与普通句子自评不冒充词义测量证据。', unavailable: '未提供', checkSpelling: '脑内拼写请根据自己的回忆自评。', pending: '正在保存录音…' }
};
let cache = {};
try { cache = JSON.parse(localStorage.getItem('multi-offline-ui') || '{}'); } catch { /* damaged UI cache is expendable */ }
cache.sessions ||= {}; cache.items ||= {}; cache.stages ||= {}; cache.undoItems ||= {}; cache.pendingUndos ||= {};
let uiLanguage = cache.uiLanguage === 'en' ? 'en' : 'zh';
const t = key => strings[uiLanguage][key] || key;
let catalog, state, session, revealed = false, busy = false, refreshJob = null, refreshTimer = null;
let contentResumeLanguage = null;
let recorder = null, stream = null, recordedURL = null, recordSaving = false, recordOpening = false, audioToken = 0, audioTimer = null, lookupToken = 0;
let audioFetch = null, lessonObjectURL = null;
let chosen = null, responseText = '', recordStatus = '', recordServerURL = null, audioHeard = false, lastAudioStatus = '', recognition = cache.recognition === true, listenFirst = cache.listenFirst === true;
const audio = $('#lesson-audio');
const task = () => session?.task;
const itemKey = () => session && task() ? `${session.sessionId}:${task().id}` : null;
const selectionKey = () => `${state?.selectedLanguage}:${state?.selectedStage}`;
const saveCache = () => { try { localStorage.setItem('multi-offline-ui', JSON.stringify(cache)); } catch { /* server remains authoritative */ } };
const taskHelper = () => task()?.helperLanguage || state?.preferences?.helpers?.[state?.selectedLanguage] || 'en';
const taskHelpers = () => task()?.helperLanguages || helperLanguages(state?.preferences, state?.selectedLanguage);
const isArabic = () => state?.selectedLanguage === 'ar';
const say = (message = '') => { $('#notice').textContent = message; $('#notice').hidden = !message; };
const updatedItemMessage = () => uiLanguage === 'zh' ? '内容或题目已更新，已恢复当前练习，请重新作答。' : 'The content or current item has changed. Resumed the current exercise; answer it again.';
const expiredTaskError = error => error.status === 409 && ['content_changed', 'task_conflict', 'session_conflict'].includes(error.code);
const adaptiveHelp=()=>uiLanguage==='zh'?'词汇水平来自跨频段的词义自评抽测，各段按有源词形总量加权，不按最高词频排名或难度分数换算。重来计0，困难计部分认识0.5，正常与轻松都计1；Easy不会额外加词。首次揭晓前答案冻结，学会并复习同词不刷测量进度。六题一组可随时返回原练习，日常学习先复习到期内容、初期每2个普通新题抽测1题，之后4:1。范围仅是宽泛参考，自评、词义及来源筛选都有误差；词族、低频尾部和听说能力未测，七语不直接比较。测量包缺失时只显示当前课程范围，保留原学习方式。':'Vocabulary level uses stratified word-meaning self-ratings weighted by sourced word-form populations, never maximum rank or difficulty. Again=0, Hard=.5, Good/Easy=1; Easy adds no extra words. First pre-reveal answers freeze; learning and repeating a measured word do not inflate progress. Six-word groups preserve your original place. Ordinary learning prioritizes due reviews and includes probes at 2:1 initially, then 4:1. Broad ranges are not validated confidence; self-ratings, senses and source qualification may be biased. Word families, low-frequency tail and productive skills are unmeasured; languages are not directly comparable. Missing assessment packs retain course-only estimates.';


function saveItem() {
  const key = itemKey();
  if (!key) return;
  cache.items[key] = { ...cache.items[key], revealed, chosen, responseText, recordServerURL, audioHeard };
  const keys = Object.keys(cache.items); // bounded display cache, never the review history
  for (const old of keys.slice(0, Math.max(0, keys.length - 200))) delete cache.items[old];
  saveCache();
}

function loadItem() {
  const saved = cache.items[itemKey()] || {};
  revealed = saved.revealed === true; chosen = saved.chosen ?? null; responseText = saved.responseText || ''; recordServerURL = saved.recordServerURL || null; recordStatus = recordServerURL ? t('recorded') : ''; audioHeard = saved.audioHeard === true; lastAudioStatus = '';
}

function setBusy(value) {
  busy = value;
  $('#practice').setAttribute('aria-busy', String(value));
  renderUndo();
  for(const id of ['assessment-start','assessment-return'])if($('#'+id))$('#'+id).disabled=value||(id==='assessment-start'&&!assessmentCanStart(session?.progress?.vocabulary))||recordSaving||recordOpening||recorder?.state==='recording';
  $('#language').disabled = value;
  document.querySelectorAll('.stage-button, .rating, #reveal, #record, #finish-writing, #practice-retry, #recognition-mode, #input-mode').forEach(button => { button.disabled = value || (button.id === 'record' && (recordSaving || recordOpening)) || (button.classList.contains('stage-button') && !(currentLanguage()?.availableStages || [1, 2, 3, 4]).includes(Number(button.dataset.stage))); });
  if ((Number(task()?.stage) === 1 || session?.purpose === 'recent-words') && !audioHeard) document.querySelectorAll('#reveal, .rating').forEach(button => { button.disabled = true; });
  for (const id of ['recent-toggle','recent-paragraph-toggle','paragraph-generate']) if ($('#'+id)) $('#'+id).disabled = value || recordSaving || recordOpening || recorder?.state === 'recording';
}

function currentLanguage() { return catalog?.languages?.find(language => language.id === state?.selectedLanguage); }

function renderShell() {
  document.documentElement.lang = uiLanguage;
  document.title = uiLanguage === 'zh' ? '多语言学习室' : 'Language room';
  $('#settings-button').textContent = t('settings'); $('#help-button').textContent = t('help');
  $('#settings-title').textContent = t('settings'); $('#help-title').textContent = t('help');
  $('#today-label').textContent = t('today');
  $('#footer-label').textContent = t('footer'); $('#dictionary-title').textContent = t('lookup');
  $('#shortcut-hint').textContent = `${t('shortcut')} · ${uiLanguage === 'zh' ? 'S · 重播语音     Backspace / Z · 撤销' : 'S · replay audio     Backspace / Z · undo'}`;
  $('#language').innerHTML = (catalog?.languages || []).map(language => `<option value="${esc(language.id)}">${esc(languageNames[language.id] || language.name)}</option>`).join('');
  $('#language').value = state?.selectedLanguage || '';
  $('#language').disabled = busy;
  const available = currentLanguage()?.availableStages || [1, 2, 3, 4];
  $('#stages').innerHTML = strings[uiLanguage].stages.map((name, index) => `<button type="button" class="stage-button" data-stage="${index + 1}" aria-current="${state?.selectedStage === index + 1}" ${busy || !available.includes(index + 1) ? 'disabled' : ''}><span class="stage-number">0${index + 1}</span>${esc(name)}</button>`).join('');
  $('#help-body').innerHTML = `<p>${esc(uiLanguage === 'zh' ? 'Ctrl+Shift+L 切换浅色 / 深色皮肤，也可使用顶部按钮或设置选项。选择即时生效并保存在当前浏览器。' : 'Ctrl+Shift+L switches light / dark skin. You can also use the top button or Settings. Your choice applies immediately and is saved in this browser.')}</p>` + ['helpText', 'helpInput', 'helpOutput', 'helpProgress'].map(key => `<p>${esc(t(key))}</p>`).join('') + `<p>${esc(adaptiveHelp())}</p>`;
  renderProgress();
}

function renderProgress() {
  const values = progressValues(session?.progress, state?.languages?.[state?.selectedLanguage], state?.preferences?.dailyGoals?.[state?.selectedLanguage] || state?.preferences?.dailyGoal);
  $('#daily-count').textContent = `${values.completed} / ${values.goal}`;
  $('#daily-bar').max = values.goal; $('#daily-bar').value = Math.min(values.goal, values.completed);
  const vocabulary = vocabularyValues(session?.progress, state?.languages?.[state?.selectedLanguage], uiLanguage, session?.purpose==='assessment' || !session?.task || session.task.stage === state?.selectedStage);
  $('#vocabulary-heading').textContent = vocabulary.headingText || (uiLanguage === 'zh' ? '词汇量（当前课程内）' : 'Vocabulary (current course)');
  $('#vocabulary-panel').setAttribute('aria-label',$('#vocabulary-heading').textContent);
  $('#vocabulary-estimate').textContent = vocabulary.estimateText;
  $('#vocabulary-recalled').textContent = vocabulary.recalledText;
  $('#vocabulary-range').textContent = vocabulary.rangeText;
  $('#assessment-progress').hidden=!vocabulary.overall;$('#assessment-progress').max=vocabulary.progressMax||36;$('#assessment-progress').value=vocabulary.progressValue||0;
  $('#vocabulary-details').hidden=!vocabulary.detailText;$('#vocabulary-detail-text').textContent=vocabulary.detailText||'';$('#vocabulary-detail-label').textContent=uiLanguage==='zh'?'估计说明':'About the estimate';
  $('#assessment-start').hidden=!currentLanguage()?.assessmentAvailable||!vocabulary.overall;$('#assessment-start').disabled=busy||recordSaving||recordOpening||recorder?.state==='recording'||!assessmentCanStart(vocabulary);
  $('#assessment-start').textContent=uiLanguage==='zh'?(session?.purpose==='assessment'?'继续校准':'校准词汇量'):(session?.purpose==='assessment'?'Continue calibration':'Calibrate vocabulary');
  $('#assessment-return').hidden=session?.purpose!=='assessment';$('#assessment-return').disabled=busy||recordSaving||recordOpening||recorder?.state==='recording';$('#assessment-return').textContent=uiLanguage==='zh'?'返回练习':'Return to practice';
}

function renderUndo() {
  const button=$('#undo-button');
  button.textContent=uiLanguage==='zh'?'撤销上一评分':'Undo last rating';
  button.disabled=busy || recorder?.state==='recording' || recordSaving || recordOpening || !session?.undo?.available || Boolean(document.querySelector('dialog[open]')) || !$('#dictionary').hidden;
}
async function undoRating() {
  if (busy || recorder?.state==='recording' || recordSaving || recordOpening || document.querySelector('dialog[open]') || !$('#dictionary').hidden) return;
  const pending=cache.pendingUndos[session?.sessionId];
  if (!pending && !session?.undo?.available) return;
  saveItem();setBusy(true);say();
  const requestData=pending || { sessionId:session.sessionId, reviewTaskId:session.undo.reviewTaskId, currentTaskId:task()?.id ?? null, requestId:crypto.randomUUID() };
  cache.pendingUndos[requestData.sessionId]=requestData;saveCache();
  try {
    const result=await request('/api/undo',{method:'POST',body:JSON.stringify(requestData)});
    cleanupMedia();session=result;
    const old=cache.undoItems[result.sessionId];
    if (result.restoredFrom && task()) {
      const saved=old?.reviewTaskId===result.restoredFrom.taskId?old.item:{};
      cache.items[itemKey()]={...saved, responseText:saved.responseText ?? result.restoredFrom.response ?? '',recordServerURL:saved.recordServerURL ?? result.restoredFrom.recordingUrls?.at(-1) ?? null,audioHeard:saved.audioHeard === true && task().audioVerified === true,pending:undefined};
    }
    delete cache.pendingUndos[requestData.sessionId];delete cache.undoItems[requestData.sessionId];loadItem();saveCache();await hydrateTaskPrompt();
    say(uiLanguage==='zh'?'已撤销上一评分，恢复上一题。':'Last rating undone. Previous item restored.');
  } catch(error) {
    say(error.message);
    if (error.status===409) { delete cache.pendingUndos[requestData.sessionId];saveCache();const resumed=await request(`/api/session/${encodeURIComponent(requestData.sessionId)}`).catch(()=>null);if(resumed){cleanupMedia();session=resumed;loadItem();saveCache();} }
  } finally {setBusy(false);renderProgress();renderPractice();}
  if(revealed)showAnswer();else showPracticeTop();
  if(task() && !audioHeard)autoPlay();
}

function targetMarkup(text,readings=task()?.japaneseReadings,annotate=revealed,vocalization=task()?.arabicVocalization,transliterations=task()?.transliterations) {
  if(isArabic())return esc(arabicDisplay(text,state?.preferences?.arabicDiacritics===true,vocalization)) + arabicTransliteration(text,transliterations,state?.preferences?.arabicTransliteration===true);
  if (state.selectedLanguage === 'hi') return esc(text) + hindiTransliteration(text, transliterations, state.preferences.hindiTransliteration !== false && (annotate || Number(task()?.practiceStage || task()?.stage) === 2));
  return state.selectedLanguage==='ja' && annotate?japaneseMarkup(text,readings):esc(text);
}

function translatedMarkup(values, field = 'meanings', provenance = task()?.helperTranslationProvenance, readings=task()?.japaneseReadings) {
  return `<div class="helper-translations">${helperTranslations(values, taskHelpers()).map(({language,text,missing}) => {
    const machine = provenance?.[field]?.[language]?.quality === 'machine-translated';
    return `<div class="helper-translation"><span class="helper-language-label">${esc(languageNames[language] || language)}${machine ? `<span class="translation-quality"> · ${uiLanguage === 'zh' ? '机器翻译' : 'Machine translation'}</span>` : ''}</span><p class="${missing ? 'missing' : 'answer-text'}" lang="${esc(language)}" dir="${language === 'ar' ? 'rtl' : 'auto'}">${missing ? esc(t('noTranslation')) : language==='ja'?japaneseMarkup(text,readings):esc(text)}</p></div>`;
  }).join('')}</div>`;
}

function sentenceMarkup(sentence) {
  let offset=0;
  return sentenceParts(sentence, task()?.entryId, task()?.display).map(part=>{
    const begin=offset;offset+=part.text.length;
    const text=state.selectedLanguage==='ja' && revealed?japaneseMarkup(sentence.text,task()?.japaneseReadings,begin,offset):isArabic()?esc(arabicDisplay(part.text,state?.preferences?.arabicDiacritics===true)):esc(part.text);
    return part.entryId?`<button type="button" class="word-link" data-entry="${esc(part.entryId)}">${text}</button>`:text;
  }).join('') + (isArabic() ? arabicTransliteration(sentence?.text || '', task()?.transliterations, state.preferences.arabicTransliteration===true) : state.selectedLanguage === 'hi' ? hindiTransliteration(sentence?.text || '', task()?.transliterations, state.preferences.hindiTransliteration !== false) : '');
}

function hanjaMarkup(item=task()) {
  if(state.selectedLanguage!=='ko' || !item?.hanja?.length) return '';
  return `<div class="korean-hanja"><span class="helper-language-label">${uiLanguage==='zh'?'汉字词形':'Hanja'}${Number(task()?.stage)>=3 ? ` · ${esc(item.display || item.lemma || '')}` : ''}</span><p lang="ko-Hani">${item.hanja.map(esc).join(' / ')}</p></div>`;
}

function targetWithHanja(markup) {
  const hanja=revealed?hanjaMarkup():'';
  return hanja?`<div class="target-with-hanja ${Number(task()?.practiceStage || task()?.stage)<=2?'hanja-under-word':''}">${markup}${hanja}</div>`:markup;
}

function audioMarkup(kind) {
  const url = task()?.audio?.[kind];
  return url ? `<button type="button" class="audio-button" id="play-audio" data-kind="${kind}"><span aria-hidden="true">▷</span> ${esc(t('play'))}</button><div id="audio-status" class="audio-status" role="status">${esc(lastAudioStatus)}</div>` : `<p id="audio-status" class="missing" role="status">${esc(t('audioMissing'))}</p>`;
}

function getOptionText(option) { return typeof option === 'string' ? option : option?.text ?? option?.display ?? option?.label ?? ''; }
function getOptionId(option, index) { return typeof option === 'object' ? option.id ?? index : index; }
function correctOptionIndex() {
  const options = task()?.options || [];
  const value = task()?.correctOption;
  if (typeof value === 'number' && value >= 0 && value < options.length) return value;
  return options.findIndex((option, index) => getOptionId(option, index) === value || getOptionText(option) === value);
}

function renderPractice() {
  if ($('#recent-controls')) {
    $('#recent-controls').hidden = state?.selectedStage !== 3 || session?.purpose === 'assessment';
    $('#recent-toggle').textContent = session?.purpose === 'recent-words'
      ? (uiLanguage === 'zh' ? '返回普通输入' : 'Return to regular input')
      : (uiLanguage === 'zh' ? '近期词短句' : 'Recent-word sentences');
    if ($('#paragraph-generate')) {$('#paragraph-generate').hidden=session?.purpose!=='recent-paragraphs'||!catalog?.providers?.paragraphGeneration?.available;$('#paragraph-generate').textContent=uiLanguage==='zh'?(task()?'换个情境':'生成小段落'):(task()?'New situation':'Generate a passage');}
    if ($('#recent-paragraph-toggle')) $('#recent-paragraph-toggle').textContent = session?.purpose === 'recent-paragraphs'
      ? (uiLanguage === 'zh' ? '返回普通输入' : 'Return to regular input')
      : (uiLanguage === 'zh' ? '词汇小段落' : 'Vocabulary passages');
  }
  const item = task();
  const previousScroll = $('#practice').dataset.taskId === item?.id ? $('#practice .card-center')?.scrollTop || 0 : 0;
  $('#practice').dataset.taskId = item?.id || '';
  if (!item && session?.purpose === 'recent-paragraphs') {
    $('#practice').innerHTML = `<div class="empty"><p>${esc(session?.generation?.message || (uiLanguage === 'zh' ? '积累至少两个词的词义回忆记录，就能生成适合你的小段落。' : 'Build meaning-recall evidence for at least two words to generate a passage.'))}</p><button type="button" id="practice-retry">${esc(t('retry'))}</button></div>`;
    setBusy(busy); return;
  }
  if (!item && session?.purpose === 'recent-words') {
    $('#practice').innerHTML = `<div class="empty"><p>${esc(uiLanguage === 'zh' ? '暂时没有匹配的已配音短句，或本轮已练完。先继续词义练习，之后再来试试。' : 'No matching voiced sentences are ready, or this round is complete. Continue vocabulary practice and try again later.')}</p><button type="button" id="practice-retry">${esc(t('retry'))}</button></div>`;
    setBusy(busy); return;
  }
  if (!item && session?.purpose==='assessment') {$('#practice').innerHTML=`<div class="empty"><p>${esc(uiLanguage==='zh'?'这组抽测已完成。可继续校准，或返回原练习。':'This group is complete. Continue calibration or return to practice.')}</p></div>`;setBusy(busy);return;}
  if (!item) { $('#practice').innerHTML = `<div class="empty"><p>${esc(t('itemEmpty'))}</p><button type="button" id="practice-retry">${esc(t('retry'))}</button></div>`; setBusy(busy); return; }
  const stage = Number(item.practiceStage || item.stage || state.selectedStage);
  const direction = isArabic() ? 'rtl' : 'auto';
  let meta = '', center = '', answer = '';
  if (stage === 1) {
    meta = `<select id="recognition-mode" aria-label="Sound exercise"><option value="spelling" ${!recognition ? 'selected' : ''}>${esc(t('spelling'))}</option><option value="recognition" ${recognition ? 'selected' : ''}>${esc(t('choices'))}</option></select>`;
    center = audioMarkup('word');
    if (recognition && item.options?.length) {
      center += `<div class="options">${item.options.map((option, index) => `<button type="button" class="option ${revealed && index === correctOptionIndex() ? 'correct' : ''} ${revealed && chosen === index && index !== correctOptionIndex() ? 'incorrect' : ''}" data-option="${index}" data-selected="${chosen === index}" ${revealed ? 'disabled' : ''} lang="${esc(state.selectedLanguage)}" dir="${direction}">${esc(isArabic()?arabicDisplay(getOptionText(option),state.preferences.arabicDiacritics===true):getOptionText(option))}</button>`).join('')}</div>`;
    } else center += `<p class="panel-note">${esc(recognition ? t('recognitionMissing') : t('recall'))}</p>`;
    if (revealed) answer = `<div class="answer"><p class="answer-label">${esc(recognition ? t('correct') : t('checkSpelling'))}</p>${targetWithHanja(`<p class="target-text" lang="${esc(state.selectedLanguage)}" dir="${direction}">${targetMarkup(item.display)}</p>`)}${translatedMarkup(item.meanings)}</div>`;
  } else if (stage === 2) {
    const reverse = item.mode === 'reverse';
    center = reverse ? translatedMarkup(item.meanings) : `${targetWithHanja(`<h1 class="target-text" lang="${esc(state.selectedLanguage)}" dir="${direction}"><button type="button" class="word-link" data-entry="${esc(item.entryId)}">${targetMarkup(item.display)}</button></h1>`)}${audioMarkup('word')}`;
    if (revealed) answer = `<div class="answer">${reverse ? `${targetWithHanja(`<p class="target-text" lang="${esc(state.selectedLanguage)}" dir="${direction}">${targetMarkup(item.display)}</p>`)}${audioMarkup('word')}` : translatedMarkup(item.meanings)}</div>`;
  } else if (stage === 3) {
    meta = `<select id="input-mode" aria-label="Input display"><option value="together" ${!listenFirst ? 'selected' : ''}>${esc(t('together'))}</option><option value="listen" ${listenFirst ? 'selected' : ''}>${esc(t('listenFirst'))}</option></select>`;
    center = (!listenFirst || revealed ? targetWithHanja(`<h1 class="target-text sentence-text ${item.generatedParagraph?'paragraph-text':''}" lang="${esc(state.selectedLanguage)}" dir="${direction}">${sentenceMarkup(item.sentence)}</h1>`) : '') + audioMarkup('sentence');
    if (revealed) answer = `<div class="answer">${translatedMarkup(item.sentence?.meanings || item.meanings, item.sentence?.meanings ? 'sentence' : 'meanings')}${item.recentTargets?.length ? `<p class="panel-note">${esc(uiLanguage === 'zh' ? '关联词：' : 'Related words: ')}${item.recentTargets.map(word => `<button type="button" class="word-link" data-entry="${esc(word.entryId)}">${esc(word.display)}${word.reason==='reinforce'?esc(uiLanguage==='zh'?'（巩固）':' (reinforce)'):''}</button>`).join(' · ')}</p>` : ''}${['recent-words','recent-paragraphs'].includes(item.purpose) ? `<p class="panel-note">${esc(item.generatedParagraph ? (uiLanguage === 'zh' ? 'AI原创 · 自评整段理解。' : 'AI-authored · rate understanding of the paragraph.') : (uiLanguage === 'zh' ? '按词形匹配；自评整句理解。' : 'Matched by word form; rate understanding of the sentence.'))}</p>` : ''}</div>`;
  } else {
    const prompt = typeof item.prompt === 'object' ? translation(item.prompt, taskHelper()) : { text: item.prompt || '', language: item.promptLanguage || 'und' };
    center = `${translatedMarkup(item.prompts || (typeof item.prompt === 'object' ? item.prompt : { [prompt.language]: prompt.text }), 'prompts')}<div class="output-response"><label class="sr-only" for="response">${esc(t('response'))}</label><textarea id="response" maxlength="10000" placeholder="${esc(t('responsePlaceholder'))}" lang="${esc(state.selectedLanguage)}" dir="${direction}">${esc(responseText)}</textarea><div class="output-tools"><button type="button" id="record" ${recordSaving ? 'disabled' : ''}>${esc(recorder?.state === 'recording' ? t('stop') : t('record'))}</button><button type="button" id="finish-writing">${esc(t('finish'))}</button><span id="recording-state" class="recording-state ${recorder?.state === 'recording' ? 'active' : ''}" role="status">${esc(recordStatus)}</span></div>${recordedURL || recordServerURL ? `<audio id="recorded-audio" class="recorded-audio" src="${esc(recordedURL || recordServerURL)}" controls></audio>` : ''}</div><span class="panel-note">${esc(t('noModel'))}</span>`;
    if (revealed) answer = `<div class="answer"><div class="answer-label">${esc(t('reference'))}</div>${targetWithHanja((item.references || []).map(reference => `<p class="answer-text" lang="${esc(state.selectedLanguage)}" dir="${direction}">${targetMarkup(typeof reference === 'string' ? reference : reference.text || '')}</p>`).join('') || `<p class="missing">${esc(t('unavailable'))}</p>`)}<span class="panel-note">${esc(t('comparison'))}</span></div>`;
  }
  $('#practice').innerHTML = `<div class="practice-meta"><span>${esc(item.purpose==='recent-paragraphs' ? (uiLanguage==='zh'?(item.sentence?.provenance?.generator==='rules'?'本地规则小段落 · 语音可选':'词汇小段落 · 语音可选'):(item.sentence?.provenance?.generator==='rules'?'Local rule passage · optional audio':'Vocabulary passage · optional audio')) : item.purpose==='recent-words' ? (uiLanguage==='zh'?'近期词 · 已配音短句':'Recent words · voiced sentences') : item.purpose==='assessment' ? (uiLanguage==='zh'?'词汇量校准 · 揭晓前回忆词义':'Vocabulary calibration · recall meaning before reveal') : item.variant?.startsWith('word-meaning-') ? (uiLanguage === 'zh' ? `${item.isReview ? '词义复习' : '词义抽查'} · 在揭晓前回忆意思` : `Word-meaning ${item.isReview ? 'review' : 'check'} · recall before revealing`) : strings[uiLanguage].stages[stage - 1])}</span>${meta}</div><div class="card-center" tabindex="0" role="region" aria-label="${esc(uiLanguage==='zh'?'题目与答案，可滚动阅读':'Question and answer, scroll to read')}">${center}${answer || '<div class="answer-placeholder" aria-hidden="true"></div>'}</div><div class="actions">${revealed ? `<div class="ratings">${t('ratings').map((label, index) => `<button type="button" class="rating" data-rating="${index + 1}"><kbd>${index + 1}</kbd><span>${esc(label)}</span></button>`).join('')}</div>` : `<button type="button" id="reveal" class="primary">${esc(t('reveal'))} <span aria-hidden="true">␣</span></button>`}</div>`;
  $('#practice .card-center').scrollTop = previousScroll;
  setBusy(busy);
}

function showPracticeTop() {
  const top = $('#practice').getBoundingClientRect().top;
  // Returning from the controls or a long answer starts the next item at its top.
  // Leave an already visible card in place during ordinary short-word practice.
  if (top < 16 || top > window.innerHeight / 4) {
    window.scrollTo({ top: Math.max(0, window.scrollY + top - 16), behavior: 'auto' });
  }
}

function showAnswer() {
  const answer = $('#practice .answer');
  if (!answer) return;
  showPracticeTop();
  const content = $('#practice .card-center');
  const viewport = content.getBoundingClientRect();
  const bounds = answer.getBoundingClientRect();
  // Keep the question still when the beginning of the answer is already visible.
  // Long prompts reveal inside the frame; the page and action row stay in place.
  if (bounds.top < viewport.top || bounds.top + Math.min(80, bounds.height) > viewport.bottom) {
    content.scrollTop += bounds.top - viewport.top - 6;
  }
}

function cleanupMedia() {
  audioToken++; clearTimeout(audioTimer); audio.pause(); audio.removeAttribute('src'); audio.load();
  audioFetch?.abort(); audioFetch = null;
  if (lessonObjectURL) URL.revokeObjectURL(lessonObjectURL);
  lessonObjectURL = null;
  if (recordedURL) URL.revokeObjectURL(recordedURL);
  recordedURL = null; recordServerURL = null; recordStatus = '';
}

async function openSession(languageId = state.selectedLanguage, stage = state.selectedStage, patch = false, purpose) {
  if (busy || recorder?.state === 'recording' || recordSaving || recordOpening) { if (recorder?.state === 'recording' || recordSaving || recordOpening) say(t('busyRecord')); $('#language').value = state.selectedLanguage; return; }
  saveItem(); setBusy(true); say(); cleanupMedia();
  $('#dictionary').hidden = true; lookupToken++;
  if(purpose==='recent-paragraphs')say(uiLanguage==='zh'?'正在准备适合你的小段落…':'Preparing your passage…');
  try {
    if (patch) state = await request('/api/state', { method: 'PATCH', body: JSON.stringify({ selectedLanguage: languageId, selectedStage: stage }) });
    const key = `${languageId}:${stage}`;
    // POST resumes the active server task. Cached IDs may refer to an inactive mode.
    session = await request('/api/session', { method: 'POST', body: JSON.stringify({ languageId, stage, ...(purpose ? {purpose} : {}), ...(stage === 1 ? { mode: recognition ? 'recognition' : 'mental-spelling' } : {}) }) });
    if (!session?.sessionId) throw new Error(t('noSession'));
    say(session.generation?.message||'');
    delete cache.activeAssessment;if(purpose)cache.activeRecent={languageId,sessionId:session.sessionId,purpose};else delete cache.activeRecent;cache.sessions[key] = session.sessionId; cache.stages[languageId] = stage; saveCache(); loadItem(); await hydrateTaskPrompt();
  } catch (error) { session = null; say(error.message); }
  finally { setBusy(false); renderShell(); renderPractice(); }
  if (session?.sessionId) showPracticeTop();
  if (task()) autoPlay();
  if (contentResumeLanguage) await resumePublishedContent();
  return Boolean(session?.sessionId);
}

async function generateParagraph(){
  if(busy||session?.purpose!=='recent-paragraphs')return;
  saveItem();setBusy(true);cleanupMedia();say(uiLanguage==='zh'?'正在根据近期学词和待巩固词写一小段…':'Writing a passage using recent and fragile words…');
  try{
    session=await request('/api/paragraphs/generate',{method:'POST',body:JSON.stringify({sessionId:session.sessionId,taskId:task()?.id??null})});
    loadItem();saveCache();say(session.generation?.message||'');
  }catch(error){say(error.message);}
  finally{setBusy(false);renderProgress();renderPractice();showPracticeTop();}
}

async function openAssessment(resumeId){
  if(busy||recorder?.state==='recording'||recordSaving||recordOpening)return;
  saveItem();setBusy(true);say();cleanupMedia();$('#dictionary').hidden=true;lookupToken++;
  try{session=resumeId?await request(`/api/session/${encodeURIComponent(resumeId)}`):await request('/api/assessment/session',{method:'POST',body:JSON.stringify({languageId:state.selectedLanguage})});
    delete cache.activeRecent;cache.activeAssessment={languageId:state.selectedLanguage,sessionId:session.sessionId};loadItem();saveCache();
  }catch(error){say(error.message);delete cache.activeAssessment;}
  finally{setBusy(false);renderProgress();renderPractice();}
  if(session?.sessionId)showPracticeTop();
  if(task())autoPlay();
}

async function resumePublishedContent() {
  if (!contentResumeLanguage || busy || recorder?.state === 'recording' || recordSaving || recordOpening) return false;
  const languageId = contentResumeLanguage; contentResumeLanguage = null;
  if (languageId !== state.selectedLanguage) return false; // switching back resumes that language through POST
  const previousTaskId = task()?.id;
  const resumed = session?.purpose==='assessment'?await openAssessment(session.sessionId):await openSession(state.selectedLanguage,state.selectedStage,false,['recent-words','recent-paragraphs'].includes(session?.purpose)?session.purpose:undefined);
  if (resumed && task()?.id !== previousTaskId) say(updatedItemMessage());
  return resumed;
}

async function restoreExpiredTask(error, expectedTaskId, expectedAudioToken) {
  if (!expiredTaskError(error) || task()?.id !== expectedTaskId || (expectedAudioToken !== undefined && expectedAudioToken !== audioToken)) return false;
  contentResumeLanguage = state.selectedLanguage;
  return resumePublishedContent();
}

function reveal() {
  if ((Number(task()?.stage) === 1 || session?.purpose === 'recent-words') && !audioHeard) return;
  if (!task() || revealed || busy || recorder?.state === 'recording' || recordSaving || recordOpening) { if (recorder?.state === 'recording' || recordSaving || recordOpening) say(t('busyRecord')); return; }
  revealed = true; saveItem(); renderPractice(); showAnswer();
}

async function hydrateTaskPrompt() {
  const item = task();
  if (!item || Number(item.stage) !== 4 || typeof item.prompt === 'object' || item.promptLanguage) return;
  try {
    const entry = (await request(`/api/lookup?${new URLSearchParams({ languageId: state.selectedLanguage, entryId: item.entryId })}`)).entry;
    if (task()?.id === item.id && entry?.output?.prompts) item.prompt = entry.output.prompts;
  } catch { /* retain the real task prompt; its language is unlabelled if unknown */ }
}

async function rate(rating) {
  if ((Number(task()?.stage) === 1 || session?.purpose === 'recent-words') && !audioHeard) return;
  if (busy || !revealed || !task() || recorder?.state === 'recording' || recordSaving || recordOpening) { if (recorder?.state === 'recording' || recordSaving || recordOpening) say(t('busyRecord')); return; }
  saveItem(); setBusy(true); say();
  const oldKey = itemKey();
  const saved = cache.items[oldKey];
  const response = Number(task().stage) === 4 ? responseText : chosen === null ? '' : getOptionText(task().options?.[chosen]);
  const pending = saved.pending || { requestId: crypto.randomUUID(), rating, response };
  saved.pending = pending; saveCache();
  let conflictError = null;
  const submittedTaskId = task().id;
  try {
    const result = await request('/api/review', { method: 'POST', body: JSON.stringify({ sessionId: session.sessionId, taskId: task().id, ...pending }) });
    const { pending: discardedPending, ...previousItem } = saved;
    cache.undoItems = { [session.sessionId]:{reviewTaskId:submittedTaskId,item:previousItem} };
    delete cache.items[oldKey]; cleanupMedia();
    session = { ...session, ...result, generation:result.generation??null }; loadItem(); saveCache(); await hydrateTaskPrompt(); say(result.generation?.message||'');
  } catch (error) {
    if (expiredTaskError(error)) conflictError = error;
    // The server explicitly rejected this old task. Keep its draft under its old
    // ID, but discard its rejected request; ordinary network failures retain it.
    if (conflictError) { delete cache.items[oldKey].pending; saveCache(); }
    say(error.message);
  }
  finally { setBusy(false); renderProgress(); renderPractice(); }
  if (!cache.items[oldKey]?.pending) showPracticeTop();
  if (conflictError) { await restoreExpiredTask(conflictError, submittedTaskId); return; }
  if (await resumePublishedContent()) return;
  if (!cache.items[oldKey]?.pending && task()) autoPlay();
}

async function playAudio(kind, automatic = false) {
  const url = task()?.audio?.[kind];
  if (!url) return;
  const taskId = task().id;
  const token = ++audioToken; clearTimeout(audioTimer); audioFetch?.abort(); audio.pause();
  let prepared = false;
  const status = message => { if (token === audioToken) { lastAudioStatus = message; if ($('#audio-status')) $('#audio-status').textContent = message; } };
  audio.onplaying = () => { if (token !== audioToken || !prepared) return; clearTimeout(audioTimer); audioHeard = true; saveItem(); setBusy(busy); status(t('playing')); };
  audio.onended = () => status(t('played'));
  audio.onerror = () => { if (token !== audioToken || !prepared) return; clearTimeout(audioTimer); audioHeard = false; saveItem(); setBusy(busy); status(t('audioFailed')); };
  try {
    // Explicitly validate each playback against the task-specific API URL. A
    // loaded media element may otherwise replay a stale task without any HTTP.
    audioHeard = false; saveItem(); setBusy(busy);
    status(uiLanguage === 'zh' ? '正在准备音频…' : 'Preparing audio…');
    const controller = new AbortController(); audioFetch = controller;
    audioTimer = setTimeout(() => controller.abort(), 45000);
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.error?.message || data.message || t('audioFailed'));
      error.status = response.status; error.code = data.error?.code; throw error;
    }
    const blob = await response.blob();
    if (token !== audioToken || task()?.id !== taskId) return;
    clearTimeout(audioTimer); audioFetch = null;
    if (!blob.size || !blob.type.startsWith('audio/')) throw new Error(t('audioFailed'));
    if (lessonObjectURL) URL.revokeObjectURL(lessonObjectURL);
    lessonObjectURL = URL.createObjectURL(blob); prepared = true;
    audio.src = lessonObjectURL; audio.load();
    audioTimer = setTimeout(() => { if (token !== audioToken) return; audioHeard = false; saveItem(); setBusy(busy); status(t('audioFailed')); }, 15000);
    await audio.play();
  }
  catch (error) {
    if (token !== audioToken) return;
    clearTimeout(audioTimer); audioFetch = null;
    if (error.name !== 'NotAllowedError') { audioHeard = false; saveItem(); setBusy(busy); }
    status(error.name === 'NotAllowedError' ? t('audioBlocked') : t('audioFailed'));
    await restoreExpiredTask(error, taskId, token);
  }
}

function autoPlay() {
  if(session?.purpose==='recent-paragraphs')return;
  const stage = Number(task()?.practiceStage || task()?.stage);
  if (stage < 4) void playAudio(stage === 3 ? 'sentence' : 'word', true);
}

async function toggleRecording() {
  if (recorder?.state === 'recording') { recorder.stop(); return; }
  if (recordOpening || recordSaving) return;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { recordStatus = t('recordingUnsupported'); renderPractice(); return; }
  try {
    recordOpening = true; setBusy(busy);
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordOpening = false;
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    const chunks = []; const sessionId = session.sessionId; const taskId = task().id;
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop()); stream = null;
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      recorder = null;
      if (recordedURL) URL.revokeObjectURL(recordedURL);
      recordedURL = URL.createObjectURL(blob); recordStatus = t('pending'); recordSaving = true; renderPractice();
      try {
        const result = await request(`/api/recording?sessionId=${encodeURIComponent(sessionId)}&taskId=${encodeURIComponent(taskId)}`, { method: 'POST', body: blob, headers: { 'Content-Type': blob.type } });
        recordServerURL = result.url; recordStatus = t('recorded'); saveItem();
      } catch (error) { recordStatus = t('recordingLocal'); say(error.message); }
      finally { recordSaving = false; renderPractice(); void resumePublishedContent(); }
    };
    recorder.onerror = event => { recordStatus = event.error?.message || t('microphoneError'); stream?.getTracks().forEach(track => track.stop()); recorder = null; renderPractice(); void resumePublishedContent(); };
    recorder.start(); recordStatus = t('recording'); renderPractice();
  } catch (error) { recordOpening = false; stream?.getTracks().forEach(track => track.stop()); stream = null; recordStatus = `${t('microphoneError')} ${error.message}`; renderPractice(); void resumePublishedContent(); }
}

function sourceMarkup(source) {
  if (typeof source === 'string') return `<li>${esc(source)}</li>`;
  let url = '';
  try { const parsed = new URL(source.url); if (['http:', 'https:'].includes(parsed.protocol)) url = parsed.href; } catch { /* only real public URLs are linked */ }
  return `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(source.title || source.id)}</a>` : esc(source.title || source.id)}${source.license ? ` · ${esc(source.license)}` : ''}${source.version ? ` · ${esc(source.version)}` : ''}</li>`;
}

function renderSettings() {
  const language = currentLanguage() || {};
  const pair = helperLanguages(state?.preferences, state?.selectedLanguage); const helper = pair[0];
  const daily = state?.preferences?.dailyGoals?.[state?.selectedLanguage] || state?.languages?.[state?.selectedLanguage]?.daily?.goal || state?.preferences?.dailyGoal || 20;
  const sources = language.sources || catalog?.sources || [];
  $('#settings-body').innerHTML = `<form id="settings-form"><div class="setting-row"><label for="skin">${esc(uiLanguage === 'zh' ? '皮肤' : 'Skin')}</label><select id="skin"><option value="light" ${document.documentElement.dataset.theme !== 'dark' ? 'selected' : ''}>Light${uiLanguage === 'zh' ? ' · 浅色' : ''}</option><option value="dark" ${document.documentElement.dataset.theme === 'dark' ? 'selected' : ''}>Dark${uiLanguage === 'zh' ? ' · 深色' : ''}</option></select></div><p class="panel-note">${esc(uiLanguage === 'zh' ? 'Ctrl+Shift+L · 切换皮肤，立即生效并自动记住。' : 'Ctrl+Shift+L · switch skin. Applies immediately and saves automatically.')}</p><div class="setting-row"><label for="helper-language">${esc(uiLanguage === 'zh' ? '两种辅助语言' : 'Two helper languages')} · ${esc(languageNames[state.selectedLanguage])}</label><div class="helper-selects">${pair.map((selected, index) => `<select id="${index ? 'helper-language-secondary' : 'helper-language'}" aria-label="${esc((uiLanguage === 'zh' ? '辅助语言 ' : 'Helper language ') + (index + 1))}">${Object.entries(languageNames).filter(([id]) => id !== state.selectedLanguage).map(([id, name]) => `<option value="${id}" ${selected === id ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>`).join('')}</div></div><div class="setting-row"><label for="interface-language">${esc(t('ui'))}</label><select id="interface-language"><option value="en" ${uiLanguage === 'en' ? 'selected' : ''}>English</option><option value="zh" ${uiLanguage === 'zh' ? 'selected' : ''}>中文</option></select></div><div class="setting-row"><label for="daily-goal">${esc(t('dailyGoal'))}</label><input id="daily-goal" type="number" min="1" max="500" value="${daily}" required></div>${isArabic()?`<div class="setting-row"><label for="arabic-diacritics">${esc(uiLanguage==='zh'?'显示阿拉伯语元音符号（حركات）':'Show Arabic vowel marks (حركات)')}</label><input id="arabic-diacritics" type="checkbox" ${state.preferences.arabicDiacritics===true?'checked':''} aria-describedby="arabic-diacritics-note"></div><p id="arabic-diacritics-note" class="panel-note">${esc(uiLanguage==='zh'?'显示词典已有的带注音原形；句子仅显示原有注音。':'Shows available vocalized dictionary forms; sentences retain only their original vowel marks.')}</p><div class="setting-row"><label for="arabic-transliteration">${esc(uiLanguage==='zh'?'显示罗马字母注音':'Show Roman-letter pronunciation')}</label><input id="arabic-transliteration" type="checkbox" ${state.preferences.arabicTransliteration===true?'checked':''} aria-describedby="arabic-transliteration-note"></div><p id="arabic-transliteration-note" class="panel-note">${esc(uiLanguage==='zh'?'在阿拉伯语下方显示词典已有的罗马字母读音；缺少读音的词句不显示。':'Shows available dictionary readings below Arabic text; words and sentences without readings are left unannotated.')}</p>`:''}<button id="save-settings" type="submit">${esc(t('save'))}</button><span id="settings-status" class="panel-note" role="status"></span></form><section class="panel-section"><h3>${esc(t('content'))} · ${esc(languageNames[language.id] || language.name || '')}</h3><dl class="coverage"><dt>${esc(t('entries'))}</dt><dd>${esc(language.entryCount ?? '—')}</dd><dt>${esc(uiLanguage === 'zh' ? '不同练习句子' : 'Distinct practice sentences')}</dt><dd>${esc(language.uniqueSentenceCount ?? language.sentenceCount ?? '—')}</dd><dt>${esc(uiLanguage === 'zh' ? '输出练习' : 'Output exercises')}</dt><dd>${esc(language.outputCount ?? '—')}</dd><dt>${esc(t('wordAudio'))}</dt><dd>${esc(language.wordAudioCount ?? language.audioCount ?? '—')}</dd><dt>${esc(t('sentenceAudio'))}</dt><dd>${esc(language.sentenceAudioCount ?? '—')} / ${esc(language.sentenceCount ?? '—')}</dd><dt>${esc(t('version'))}</dt><dd>${esc(language.version || '—')}</dd></dl><div class="refresh-controls"><label class="panel-note" for="content-limit">${esc(t('limit'))}</label><input id="content-limit" type="number" min="1" max="1000" value="${Math.max(50, Number(language.entryCount) || 0)}"><button id="refresh-content" type="button" ${refreshJob ? 'disabled' : ''}>${esc(t('refresh'))}</button></div><p class="panel-note">${esc(t('refreshNote'))}</p><div id="job-status" class="job-status" role="status">${refreshJob ? esc(refreshJob.message || t('running')) : ''}</div></section><section class="panel-section"><h3>${esc(t('sources'))}</h3>${sources.length ? `<ul class="source-list">${sources.map(sourceMarkup).join('')}</ul>` : `<p class="panel-note">${esc(t('noSources'))}</p>`}${task()?.sourceIds?.length ? `<p class="panel-note">${esc(t('sourceIds'))}: ${task().sourceIds.map(esc).join(', ')}</p>` : ''}</section>`;
  if (state.selectedLanguage === 'hi') $('#save-settings').insertAdjacentHTML('beforebegin', `<div class="setting-row"><label for="hindi-transliteration">${esc(uiLanguage === 'zh' ? '显示印地语拉丁转写' : 'Show Hindi transliteration')}</label><input id="hindi-transliteration" type="checkbox" ${state.preferences.hindiTransliteration !== false ? 'checked' : ''}></div>`);
}

async function saveSettings(event) {
  event.preventDefault();
  const pair = [$('#helper-language').value, $('#helper-language-secondary').value]; if (pair[0] === pair[1]) { $('#settings-status').textContent = uiLanguage === 'zh' ? '请选择两种不同的辅助语言。' : 'Choose two different helper languages.'; return; } const nextUI = $('#interface-language').value; const goal = Number($('#daily-goal').value);
  const arabicPreference=$('#arabic-diacritics')?{arabicDiacritics:$('#arabic-diacritics').checked,arabicTransliteration:$('#arabic-transliteration').checked}:{};
  const hindiPreference=$('#hindi-transliteration')?{hindiTransliteration:$('#hindi-transliteration').checked}:{};
  saveItem(); const previousTaskId = task()?.id; let contentChanged = false;
  $('#save-settings').disabled = true; $('#settings-status').textContent = t('saving');
  try {
    state = await request('/api/state', { method: 'PATCH', body: JSON.stringify({ preferences: { helperPairs: { [state.selectedLanguage]: pair }, dailyGoals: { [state.selectedLanguage]: goal },...arabicPreference,...hindiPreference } }) });
    uiLanguage = nextUI; cache.uiLanguage = uiLanguage; saveCache();
    // Fetch the updated current task so its prompt also uses the selected helper.
    // This retains task ID, local draft, reveal state and review history.
    if (session?.sessionId) {
      const resumed = await request(`/api/session/${encodeURIComponent(session.sessionId)}`);
      if (resumed.task?.id !== previousTaskId && (recorder?.state === 'recording' || recordSaving || recordOpening)) contentResumeLanguage = state.selectedLanguage;
      else {
        session = resumed;
        if (task()?.id !== previousTaskId) { cleanupMedia(); loadItem(); contentChanged = true; }
      }
      await hydrateTaskPrompt();
    }
    renderShell(); renderPractice(); renderSettings(); $('#settings-status').textContent = t('saved');
    if (session?.progress?.daily) { session.progress.daily.goal = state.languages?.[state.selectedLanguage]?.daily?.goal || goal; renderProgress(); }
    if (contentChanged) { say(updatedItemMessage()); if (task()) autoPlay(); }
  } catch (error) { $('#settings-status').textContent = error.message; }
  finally { $('#save-settings').disabled = false; }
}

async function refreshContent() {
  const limit = Number($('#content-limit').value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) { $('#content-limit').reportValidity(); return; }
  const languageId = state.selectedLanguage;
  $('#refresh-content').disabled = true; $('#job-status').textContent = t('running');
  try {
    refreshJob = { languageId, ...await request('/api/content/refresh', { method: 'POST', body: JSON.stringify({ languageId, limit }) }) };
    cache.refreshJob = refreshJob; saveCache(); await pollRefresh();
  } catch (error) { refreshJob = null; $('#job-status').textContent = error.message; $('#refresh-content').disabled = false; }
}

async function pollRefresh() {
  if (!refreshJob) return;
  try {
    const job = await request(`/api/content/jobs/${encodeURIComponent(refreshJob.jobId)}`);
    refreshJob = { ...refreshJob, ...job };
    if ($('#job-status')) $('#job-status').textContent = job.message || t(job.status === 'completed' ? 'complete' : job.status === 'failed' ? 'failed' : 'running');
    if (['completed', 'failed'].includes(job.status)) {
      const message = job.message || t(job.status === 'completed' ? 'complete' : 'failed');
      const languageId = refreshJob.languageId;
      refreshJob = null; delete cache.refreshJob; saveCache();
      if (job.status === 'completed') {
        catalog = await request('/api/catalog'); renderShell(); renderSettings();
        contentResumeLanguage = languageId;
        await resumePublishedContent();
      }
      if ($('#job-status')) $('#job-status').textContent = message;
      if ($('#refresh-content')) $('#refresh-content').disabled = false;
    } else { cache.refreshJob = refreshJob; saveCache(); refreshTimer = setTimeout(pollRefresh, 1500); }
  } catch (error) {
    if ($('#job-status')) $('#job-status').textContent = error.message;
    if (error.status === 404) { refreshJob = null; delete cache.refreshJob; saveCache(); if ($('#refresh-content')) $('#refresh-content').disabled = false; return; }
    // Keep the job ID so a refresh can resume monitoring without launching another job.
    refreshTimer = setTimeout(pollRefresh, 5000);
  }
}

async function lookup(entryId) {
  const token = ++lookupToken;
  $('#dictionary').hidden = false; $('#dictionary-body').textContent = t('loading');
  $('#dictionary-close').focus();
  try {
    const params = new URLSearchParams({ languageId: state.selectedLanguage, entryId });
    if (task()?.sentence?.id) params.set('sentenceId', task().sentence.id);
    const result = await request(`/api/lookup?${params}`);
    if (token !== lookupToken) return;
    const entry = result.entry || {};
    const context = result.context;
    const contextText = typeof context === 'string' ? context : context?.status === 'annotated' && context.tokens?.length ? context.tokens.filter(token => token.function).map(token => `${token.text}: ${token.function}`).join('\n') : context?.function || context?.note || context?.text || context?.explanation;
    $('#dictionary-body').innerHTML = `<h3 lang="${esc(state.selectedLanguage)}" dir="${isArabic() ? 'rtl' : 'auto'}">${targetMarkup(entry.display || entry.lemma, entry.japaneseReadings, true, entry.arabicVocalization, entry.transliterations)}</h3><div class="panel-note">${esc(entry.ipa || '')}</div>${hanjaMarkup(entry)}${translatedMarkup(entry.meanings, 'meanings', entry.helperTranslationProvenance, entry.japaneseReadings)}<dl>${entry.lemma ? `<dt>${esc(t('lemma'))}</dt><dd>${targetMarkup(entry.lemma, entry.japaneseReadings, true, entry.arabicVocalization, entry.transliterations)}</dd>` : ''}${entry.pos ? `<dt>${esc(t('pos'))}</dt><dd>${esc(entry.pos)}</dd>` : ''}${entry.forms?.length ? `<dt>${esc(t('forms'))}</dt><dd>${entry.forms.map(form => targetMarkup(typeof form === 'string' ? form : form.text, entry.japaneseReadings, true, null, entry.transliterations) + (typeof form === 'object' && form.description ? ` · ${esc(form.description)}` : '')).join('<br>')}</dd>` : ''}<dt>${esc(t('context'))}</dt><dd>${isArabic()?targetMarkup(contextText || t('noContext')):esc(contextText || t('noContext'))}</dd>${entry.quality ? `<dt>${esc(t('quality'))}</dt><dd>${esc(entry.quality)}</dd>` : ''}</dl>${entry.sourceIds?.length ? `<p class="panel-note">${esc(t('sourceIds'))}: ${entry.sourceIds.map(esc).join(', ')}</p>` : ''}`;
  } catch (error) { if (token === lookupToken) $('#dictionary-body').textContent = error.message; }
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#dictionary').hidden) { $('#dictionary').hidden = true; lookupToken++; }
  const playButton = $('#play-audio');
  const action = shortcutAction(event, { revealed, busy, hasTask: Boolean(task()), canUndo:session?.undo?.available===true, canPlay:Boolean(playButton && !playButton.disabled), recording:recorder?.state==='recording'||recordSaving||recordOpening, dialogOpen: Boolean(document.querySelector('dialog[open]')) || !$('#dictionary').hidden });
  if (!action) return;
  event.preventDefault(); if (action.type === 'undo') void undoRating(); else if (action.type === 'replay') void playAudio(playButton.dataset.kind); else if (action.type === 'reveal') reveal(); else void rate(action.rating);
});
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.close) return document.getElementById(button.dataset.close).close();
  if(button.id==='paragraph-generate'){void generateParagraph();button.blur();}
  else if(button.id==='recent-paragraph-toggle'){void openSession(state.selectedLanguage,3,true,session?.purpose==='recent-paragraphs'?undefined:'recent-paragraphs');button.blur();}
  else if(button.id==='recent-toggle'){void openSession(state.selectedLanguage,3,true,session?.purpose==='recent-words'?undefined:'recent-words');button.blur();}
  else if(button.id==='assessment-start'){void openAssessment();button.blur();}
  else if(button.id==='assessment-return'){void openSession();button.blur();}
  else if (button.dataset.stage) { void openSession(state.selectedLanguage, Number(button.dataset.stage), true); button.blur(); }
  else if (button.dataset.rating) { void rate(Number(button.dataset.rating)); button.blur(); }
  else if (button.dataset.entry) void lookup(button.dataset.entry);
  else if (button.dataset.option) { chosen = Number(button.dataset.option); saveItem(); renderPractice(); }
  else if (button.id === 'reveal') { reveal(); button.blur(); }
  else if (button.id === 'play-audio') { void playAudio(button.dataset.kind); if (event.detail > 0) button.blur(); }
  else if (button.id === 'record') void toggleRecording();
  else if (button.id === 'finish-writing') { $('#response').blur(); saveItem(); reveal(); }
  else if (button.id === 'settings-button') { renderSettings(); $('#settings-dialog').showModal(); }
  else if (button.id === 'help-button') $('#help-dialog').showModal();
  else if (button.id === 'dictionary-close') { $('#dictionary').hidden = true; lookupToken++; }
  else if (button.id === 'refresh-content') void refreshContent();
  else if (button.id === 'practice-retry') void openSession(state.selectedLanguage,state.selectedStage,false,['recent-words','recent-paragraphs'].includes(session?.purpose)?session.purpose:undefined);
  else if (button.id === 'undo-button') { void undoRating(); button.blur(); }
});
document.addEventListener('input', event => { if (event.target.id === 'response') { responseText = event.target.value; saveItem(); } });
document.addEventListener('change', event => {
  if (event.target.id === 'language') {
    const languageId = event.target.value;
    const language = catalog.languages.find(item => item.id === languageId);
    const available = language?.availableStages || [1, 2, 3, 4];
    const preferred = Number(cache.stages[languageId] ?? language?.suggestedStage ?? 1);
    void openSession(languageId, available.includes(preferred) ? preferred : available[0], true); event.target.blur();
  } else if (event.target.id === 'recognition-mode') { recognition = event.target.value === 'recognition'; cache.recognition = recognition; saveCache(); void openSession(); }
  else if (event.target.id === 'input-mode') { listenFirst = event.target.value === 'listen'; cache.listenFirst = listenFirst; saveCache(); renderPractice(); }
});
document.addEventListener('submit', event => { if (event.target.id === 'settings-form') void saveSettings(event); });
window.addEventListener('pagehide', () => { if (!window.multiOffline?.restoring) saveItem(); stream?.getTracks().forEach(track => track.stop()); clearTimeout(refreshTimer); audio.pause(); });

async function initialize() {
  setBusy(true);
  try {
    [catalog, state] = await Promise.all([request('/api/catalog'), request('/api/state')]);
    const priorAssessment=cache.activeAssessment,priorRecent=cache.activeRecent;renderShell(); setBusy(false); await openSession();
    if(priorAssessment?.languageId===state.selectedLanguage)await openAssessment(priorAssessment.sessionId);
    if(priorRecent?.languageId===state.selectedLanguage&&!priorAssessment)await openSession(state.selectedLanguage,3,true,priorRecent.purpose??'recent-words');
    if(cache.pendingUndos[session?.sessionId])await undoRating();
    if (cache.refreshJob?.jobId) { refreshJob = cache.refreshJob; void pollRefresh(); }
  } catch (error) {
    setBusy(false); say(error.message);
    $('#practice').innerHTML = `<div class="empty"><p>${esc(t('noSession'))}</p><button type="button" id="startup-retry">${esc(t('retry'))}</button></div>`;
    $('#startup-retry').onclick = initialize;
  }
}
void initialize();

window.travelCanReload=()=>!busy&&!recordSaving&&!recordOpening&&recorder?.state!=='recording'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
