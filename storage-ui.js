import {localize} from './locale.js';
import { OfflineStorage,megabytes } from './storage.js';
import { resourceLock } from './resource-cache.js';
import { publicAsset } from './assets.js';
export function mountStorage({release,base,cache,registration,section,fetcher}){
  const storage=new OfflineStorage(release,base),state={busy:false},get=id=>section.querySelector('#'+id),message=text=>{get('install-status').textContent=text;};
  section.insertAdjacentHTML('beforeend','<p id="download-summary" role="status"></p><progress id="verify-progress" max="1" value="0" hidden></progress><p id="verification-status" role="status"></p><h3>本机存储</h3><p id="storage-summary">点击检查可查看音频、教材与重复文件。</p><p id="storage-estimate"></p><p id="storage-details"></p><button id="inspect-storage" type="button">检查已保存内容</button><button id="compact-storage" type="button">整理旧版本缓存</button><button id="clear-offline-audio" type="button">清理离线音频</button><small>这些是浏览器保存的磁盘文件，不是一直占用的运行内存。这里只清理公开缓存，保留学习进度、草稿、录音和登录状态；各设备和浏览器分别管理。</small>');
  function busy(value){state.busy=value;for(const id of ['download-course','inspect-storage','compact-storage','clear-offline-audio'])get(id).disabled=value;}
  function verifying(row){get('verify-progress').hidden=false;get('verify-progress').max=Math.max(1,row.total);get('verify-progress').value=row.checked;get('verification-status').textContent=`正在核对已有文件 ${row.checked} / ${row.total}，此计数不是重新下载。`;}
  function saved(count,bytes){const bar=get('install-progress');bar.hidden=false;bar.max=storage.totalBytes;bar.value=bytes;get('download-summary').textContent=`已确认保存 ${count} / ${storage.bundle.length} 项 · ${megabytes(bytes)} / ${megabytes(storage.totalBytes)}；待补齐 ${megabytes(Math.max(0,storage.totalBytes-bytes))}。`;}
  async function estimate(){try{const row=await navigator.storage?.estimate?.();if(Number.isFinite(row?.usage))get('storage-estimate').textContent=`浏览器估算此域名总占用 ${megabytes(row.usage)}（可能包含同域其他网页、个人数据及存储开销；清理后数字可能稍后更新）。`;}catch{}}
  async function lastSaved(){const previous=await storage.checkpoint();if(previous){const bar=get('install-progress');bar.hidden=false;bar.max=storage.totalBytes;bar.value=Math.min(previous.bytes,storage.totalBytes);get('download-summary').textContent=`上次记录已保存 ${previous.count} 项 · ${megabytes(previous.bytes)}。${previous.version===release.version?'':'网站已更新，'}续传前会核对实际文件，不会因刷新把已有下载清零。`;}else get('download-summary').textContent='尚无本版核对记录；旧下载仍可能保留。点击检查或继续下载，会先寻找可复用文件。';await estimate();}
  async function inspect(){const row=await storage.inspect(verifying);saved(row.available.size,row.savedBytes);get('storage-summary').textContent=`已核对资源文件 ${megabytes(row.bytes)}：音频 ${megabytes(row.audioBytes)}，程序/教材 ${megabytes(row.bytes-row.audioBytes)}；重复文件 ${megabytes(row.duplicateBytes)}。`;get('storage-details').textContent=`旧版本缓存 ${row.oldVersions} 个${row.unknown?`（其中 ${row.unknown} 个未完整安装）`:''}。文件内容大小与浏览器实际磁盘占用可能不同。`;get('verification-status').textContent='已有文件核对完成，没有为检查而重新下载。';get('verify-progress').hidden=true;if(!row.missing.length)await cache.put(new URL('offline-ready',base),new Response(release.version));else await cache.delete(new URL('offline-ready',base));await estimate();return row;}
  const action=callback=>async()=>{if(state.busy)return;try{await resourceLock(async()=>{busy(true);try{await callback();}finally{busy(false);}});}catch(error){message(error.name==='QuotaExceededError'?'存储空间不足，学习进度未清除。可先清理离线音频，再尝试整理。':error.message);}};
  get('inspect-storage').onclick=action(inspect);
  get('clear-offline-audio').onclick=action(async()=>{await storage.guard(registration);if(!confirm(localize('只清理本浏览器保存的离线音频。教材、学习进度、草稿、录音和登录状态保留；以后可在线播放或重新下载。确定清理？')))return;message('正在清理离线音频…');await storage.clearAudio();get('storage-summary').textContent='离线音频已清理，程序与教材保留。可再次检查剩余文件占用。';get('download-summary').textContent='离线音频已清理；进度、草稿、录音和登录状态未清除。';get('install-progress').hidden=true;await estimate();message('离线音频已清理，在线学习可继续。');});
  get('compact-storage').onclick=action(async()=>{await storage.guard(registration);if(!confirm(localize('先保留当前版本可复用的教材和音频，再删除过期版本与重复文件。学习进度、草稿、录音和登录状态保留。确定整理？')))return;message('正在保留可复用文件并整理旧缓存…');const result=await storage.compact(verifying);await inspect();message(`整理完成：移除 ${result.removedVersions} 个旧版本缓存，可复用音频保留一份。`);});
  get('download-course').onclick=action(async()=>{
    let count=0,bytes=0,checked=false,newCount=0,newBytes=0,wake,checkpoint=Promise.resolve();
    const persist=()=>{const c=count,b=bytes;checkpoint=checkpoint.then(()=>storage.remember(c,b));};
    try{
      try{wake=await navigator.wakeLock?.request?.('screen');}catch{}
      message('先核对已保存内容，已有完整文件不会重新下载。');const inventory=await inspect();count=inventory.available.size;bytes=inventory.savedBytes;checked=true;const queue=inventory.missing;
      message(`已复用 ${count} 项，仅补齐缺少的 ${queue.length} 项。`);
      const worker=async()=>{while(queue.length){const asset=queue.shift(),response=await publicAsset(storage.current,base,asset,{required:true,fetcher,onNetwork:asset=>{newCount++;newBytes+=asset.bytes;}});await response.body?.cancel();count++;bytes+=asset.bytes;saved(count,bytes);message(`正在补齐 · 本次新下载 ${newCount} 项 / ${megabytes(newBytes)}。可关闭设置继续学习，请保持页面打开。`);if(count%20===0)persist();}};
      const results=await Promise.allSettled(Array.from({length:6},worker)),failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
      await cache.put(new URL('offline-ready',base),new Response(release.version));message(`完整离线包已就绪 · 本次新下载 ${newCount} 项 / ${megabytes(newBytes)}，其余直接复用。`);get('download-course').textContent='检查并补全离线包';
    }catch(error){message(error.name==='QuotaExceededError'?'设备空间不足，已下载部分保留。在线学习仍可继续。':error.message+' 已完成部分保留，可继续下载；在线学习不受影响。');get('download-course').textContent='继续下载离线包';}
    finally{await checkpoint;if(checked)await storage.remember(count,bytes,count===storage.bundle.length);await wake?.release?.().catch(()=>{});await estimate();}
  });
  void lastSaved();return state;
}
