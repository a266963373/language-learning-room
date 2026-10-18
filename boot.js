import { OfflineEngine, CACHE_PREFIX } from './engine.js';
import { openDatabase } from './store.js';
import { sha256 } from './crypto.js';
import { exportBackup, readBackup, restoreBackup } from './backup.js';
import { SupabaseSync } from './sync.js';
const base=new URL('./',location.href),nativeFetch=window.fetch.bind(window),shell=document.querySelector('.app-shell');
const panel=document.createElement('main');panel.className='installer';panel.innerHTML='<p>LANGUAGE ROOM · TRAVEL</p><h1>九门语言，随身学。</h1><p>完整教材和已配音内容下载到当前设备。出门前请在Wi-Fi下完成下载；日常学习可离线使用。</p><p>iPhone：Safari“分享 → 添加到主屏幕”，再从图标进入下载。手机和电脑使用同一个同步账号。</p><progress id="install-progress" max="1" value="0"></progress><p id="install-status" role="status">正在检查离线环境…</p><button id="download-course" type="button" class="primary" disabled>下载九语学习包</button><p>已有电脑进度请在原学习室导出九语备份，再到本应用的“设置与内容”导入。备份属于个人数据，请勿上传公开仓库。</p>';document.body.append(panel);
const status=panel.querySelector('#install-status'),progress=panel.querySelector('progress'),download=panel.querySelector('button');
let registration,engine,cache,release,documentPack,manager;
export function saveFile(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
const message=text=>{status.textContent=text;};
function controls(syncConfig) {
  const controls=document.createElement('section');controls.className='offline-controls';controls.innerHTML='<div><strong>手机与电脑同步</strong><p id="sync-status" role="status">检查同步状态…</p></div><form id="sync-login"><label>邮箱 <input id="sync-email" type="email" autocomplete="username" required></label><label>密码 <input id="sync-password" type="password" autocomplete="current-password" required></label><button type="submit">登录并同步</button></form><button type="button" id="sync-now">立即同步</button><button type="button" id="sync-signout">退出同步账号</button><div id="sync-conflict" hidden><p>为避免覆盖，已暂停同步。先备份两份进度，再选择继续哪一份。</p><button type="button" id="backup-local-conflict">备份本机版本</button><button type="button" id="backup-cloud-conflict">备份云端版本</button><button type="button" id="choose-local">继续本机版本</button><button type="button" id="choose-cloud">继续云端版本</button></div><button type="button" id="export-backup">导出九语备份</button><button type="button" id="import-backup">导入九语备份</button><input id="backup-file" type="file" accept="application/json,.json" hidden><span id="backup-status" role="status"></span><small>登录后，进度、设置、草稿和私人录音同步至你的专属云存档。离线时先存本机，重新联网后自动同步。两台设备同时离线修改同一语言时，会保留两份并请你选择，绝不静默覆盖。请定期导出备份。</small>';
  document.querySelector('#settings-dialog .panel-heading').after(controls);
  const indicator=document.createElement('p');indicator.className='offline-status';shell.querySelector('.learning-tools').append(indicator);
  manager=new SupabaseSync(engine,syncConfig,{fetcher:nativeFetch,canApply:()=>window.travelCanReload?.()!==false,onStatus:(text,kind)=>{controls.querySelector('#sync-status').textContent=text;indicator.textContent=text;controls.querySelector('#sync-conflict').hidden=kind!=='conflict';controls.querySelector('#sync-login').hidden=Boolean(manager.auth);controls.querySelector('#sync-signout').hidden=!manager.auth;},onApply:()=>{window.multiOffline.restoring=true;location.reload();}});
  window.multiOffline.sync=manager;
  let busy=false;const feedback=controls.querySelector('#backup-status');
  const action=callback=>async event=>{event?.preventDefault();if(busy)return;busy=true;try{await callback(event);}catch(error){feedback.textContent=error.message;}finally{busy=false;}};
  controls.querySelector('#sync-login').onsubmit=action(async()=>{const email=controls.querySelector('#sync-email').value,password=controls.querySelector('#sync-password').value;controls.querySelector('#sync-password').value='';controls.querySelector('#sync-login button').focus();await manager.signIn(email,password);});
  controls.querySelector('#sync-now').onclick=action(()=>manager.sync());controls.querySelector('#sync-signout').onclick=action(()=>manager.signOut());
  controls.querySelector('#export-backup').onclick=action(async()=>{saveFile(await exportBackup(engine),`language-room-backup-${new Date().toISOString().slice(0,10)}.json`);feedback.textContent='已生成九语备份，请保存文件。';});
  controls.querySelector('#import-backup').onclick=()=>controls.querySelector('#backup-file').click();
  controls.querySelector('#backup-file').onchange=action(async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;const payload=await readBackup(file,engine);if(!confirm('导入会替换当前设备的九语进度和录音；登录后会同步这份进度。继续前将先导出当前备份。确定导入？'))return;saveFile(await exportBackup(engine),`language-room-before-import-${Date.now()}.json`);await manager.run(()=>restoreBackup(engine,payload));location.reload();});
  for(const which of ['local','cloud']) {
    controls.querySelector(`#backup-${which}-conflict`).onclick=action(async()=>saveFile(await manager.conflictBackup(which),`language-room-${which}-${Date.now()}.json`));
    controls.querySelector(`#choose-${which}`).onclick=action(async()=>{if(!confirm(`将继续${which==='local'?'本机':'云端'}版本。选择前会下载另一版本的完整备份，请保存好。是否继续？`))return;saveFile(await manager.conflictBackup(which==='local'?'cloud':'local'),`language-room-alternate-${Date.now()}.json`);await manager.resolve(which);});
  }
  const repair=document.createElement('button');repair.type='button';repair.textContent='补全教材或音频';repair.onclick=()=>{document.body.append(panel);shell.hidden=true;download.disabled=false;download.textContent='检查并补全九语学习包';};controls.append(repair);
  const update=document.createElement('button');update.type='button';update.textContent='有更新 · 安装新版';update.hidden=true;controls.append(update);const notify=()=>{update.hidden=!registration.waiting;};notify();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',notify));update.onclick=()=>{if(registration.waiting&&confirm('更新会保留本机存档并重新打开应用。请先结束录音。')){navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting.postMessage('activate-update');}};
  manager.start();
}
async function launch() {
  if(engine){location.reload();return;}
  engine=await new OfflineEngine(await openDatabase(),documentPack,base).init();window.multiOffline={engine,release};
  const configResponse=await cache.match(new URL('sync-config.json',base)),syncConfig=await configResponse.json();
  shell.hidden=false;panel.remove();controls(syncConfig);
  window.fetch=(input,options={})=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/api/'))return manager.run(async()=>{const result=await engine.handle(url,options);if(result.ok)manager.schedule();return result;});return nativeFetch(input,options);};
  window.addEventListener('storage',event=>{if(event.key==='multi-offline-import-id'){window.multiOffline.restoring=true;location.reload();}});
  await import('./app.js');try{await navigator.storage?.persist?.();}catch{}
}
async function downloadAudio() {
  download.disabled=true;let completed=0,wake;const queue=[...release.audio];progress.max=queue.length;
  try {
    try{wake=await navigator.wakeLock?.request?.('screen');}catch{}
    const worker=async()=>{while(queue.length){const asset=queue.shift(),url=new URL(asset.path,base);let response=await cache.match(url),bytes=response?await response.arrayBuffer():null;
      if(!bytes){response=await caches.match(url);if(response)bytes=await response.arrayBuffer();}
      if(!bytes||sha256(bytes)!==asset.sha256){response=await nativeFetch(url,{cache:'no-store'});if(!response.ok)throw new Error('下载中断，已完成部分保留，可继续下载。');bytes=await response.arrayBuffer();if(sha256(bytes)!==asset.sha256)throw new Error('音频校验失败，请重试。');}
      await cache.put(url,new Response(bytes,{headers:{'Content-Type':asset.type}}));progress.value=++completed;message(`正在准备 ${completed} / ${release.audio.length} 项音频。请保持页面打开。`);
    }};
    const results=await Promise.allSettled(Array.from({length:6},worker)),failed=results.find(result=>result.status==='rejected');if(failed)throw failed.reason;
    await cache.put(new URL('offline-ready',base),new Response(release.version));await launch();
  }catch(error){message(error.name==='QuotaExceededError'?'设备空间不足，已下载部分保留。请先备份并释放空间。':error.message);download.disabled=false;download.textContent='继续下载';}finally{await wake?.release?.().catch(()=>{});}
}
download.onclick=()=>void downloadAudio();
async function initialize() {
  try {
    if(!isSecureContext||!('serviceWorker'in navigator)||!('indexedDB'in window))throw new Error('请通过HTTPS网址打开；iPhone不能直接打开ZIP安装。');
    registration=await navigator.serviceWorker.register(new URL('service-worker.js',base),{scope:base.pathname,updateViaCache:'none'});
    if(!navigator.serviceWorker.controller)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>finish(new Error('离线组件尚未下载完成，请联网重试。')),180000),worker=registration.installing;const finish=error=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',controlled);worker?.removeEventListener('statechange',changed);error?reject(error):resolve();},controlled=()=>{if(navigator.serviceWorker.controller)finish();},changed=()=>{if(worker.state==='redundant'&&!registration.active)finish(new Error('离线组件下载失败，请联网重试。'));};navigator.serviceWorker.addEventListener('controllerchange',controlled);worker?.addEventListener('statechange',changed);controlled();});
    const response=await nativeFetch(new URL('release.json',base));if(!response.ok)throw new Error('学习包暂时无法加载。');release=await response.json();cache=await caches.open(CACHE_PREFIX+release.version);
    const courseResponse=await cache.match(new URL('course.json',base));if(!courseResponse)throw new Error('应用更新尚未完成，请刷新重试。');documentPack=await courseResponse.json();
    const ready=await cache.match(new URL('offline-ready',base));if(ready&&(await ready.text())===release.version){await launch();return;}
    message(`九语音频约 ${(release.audio.reduce((total,row)=>total+row.bytes,0)/1024/1024).toFixed(0)} MB，程序和教材另占空间。完整下载后可离线学习。`);download.disabled=false;
  }catch(error){message(error.message);download.disabled=false;download.textContent='重试';download.onclick=()=>location.reload();}
}
void initialize();
