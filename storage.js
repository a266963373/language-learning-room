import { sha256 } from './crypto.js';
import { VERSION_CACHE,AUDIO_CACHE,META_CACHE,audioCacheName,cachedAsset,isAudio } from './resource-cache.js';
export const megabytes=bytes=>(bytes/1024/1024).toFixed(1)+' MB';
export class OfflineStorage {
  constructor(release,base){this.release=release;this.base=base;this.current='language-room-multi-'+release.version;this.bundle=[...release.shell.filter(a=>a.path.startsWith('languages/')),...release.audio];this.bundleMap=new Map(this.bundle.map(a=>[a.path,a]));this.totalBytes=this.bundle.reduce((n,a)=>n+a.bytes,0);}
  async checkpoint(){const response=await (await caches.open(META_CACHE)).match(new URL('offline-checkpoint.json',this.base));try{return response?await response.json():null;}catch{return null;}}
  async remember(count,bytes,complete=false){try{await (await caches.open(META_CACHE)).put(new URL('offline-checkpoint.json',this.base),new Response(JSON.stringify({version:this.release.version,count,bytes,total:this.bundle.length,totalBytes:this.totalBytes,complete,checkedAt:Date.now()}),{headers:{'Content-Type':'application/json'}}));}catch{/* A missing progress label never discards downloaded files. */}}
  async inspect(onProgress=()=>{}){
    const names=await caches.keys(),versions=names.filter(n=>VERSION_CACHE.test(n)),shards=names.filter(n=>AUDIO_CACHE.test(n)),tasks=[],unknown=[],available=new Map(),seen=new Set();let bytes=0,audioBytes=0,duplicateBytes=0,checked=0;
    for(const name of versions){const cache=await caches.open(name),response=await cache.match(new URL('release.json',this.base));let manifest;
      try{manifest=response?await response.json():null;}catch{}
      if(!manifest||manifest.format!=='language-room-multi-offline'||!Array.isArray(manifest.shell)||!Array.isArray(manifest.audio)){unknown.push(name);continue;}
      for(const asset of [...manifest.shell,...manifest.audio])tasks.push({name,asset});
    }
    // Small content-hash shards avoid requesting tens of thousands of Cache keys at once.
    for(const name of shards){const cache=await caches.open(name);for(const request of await cache.keys()){const url=new URL(request.url);if(url.origin!==this.base.origin||!url.pathname.startsWith(this.base.pathname+'audio/'))continue;tasks.push({name,asset:{path:url.pathname.slice(this.base.pathname.length)}});}}
    let cursor=0;const worker=async()=>{while(cursor<tasks.length){const {name,asset}=tasks[cursor++],cache=await caches.open(name),response=await cache.match(new URL(asset.path,this.base));if(response){const data=await response.arrayBuffer(),digest=sha256(data),key=asset.path+'|'+digest;bytes+=data.byteLength;if(isAudio(asset))audioBytes+=data.byteLength;if(seen.has(key))duplicateBytes+=data.byteLength;else seen.add(key);const wanted=this.bundleMap.get(asset.path);if(wanted&&wanted.bytes===data.byteLength&&wanted.sha256===digest)available.set(asset.path,{...wanted,name});}checked++;if(checked%100===0)onProgress({checked,total:tasks.length,available:available.size});}};
    const results=await Promise.allSettled(Array.from({length:4},worker)),failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;onProgress({checked,total:tasks.length,available:available.size});
    const savedBytes=[...available.values()].reduce((n,a)=>n+a.bytes,0),result={bytes,audioBytes,duplicateBytes,available,savedBytes,oldVersions:versions.filter(n=>n!==this.current).length,unknown:unknown.length,missing:this.bundle.filter(a=>!available.has(a.path))};await this.remember(available.size,savedBytes,result.missing.length===0);return result;
  }
  async guard(registration){
    this.registration=registration;
    if(registration.installing||registration.waiting)throw new Error('网站正在更新，请先完成更新，再管理旧缓存。');
    const worker=navigator.serviceWorker.controller;if(!worker)throw new Error('请刷新学习室后再管理存储。');
    const status=await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('无法确认页面版本，请刷新后再清理。'));},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};worker.postMessage({type:'storage-status'},[channel.port2]);});
    if(status.version!==this.release.version)throw new Error('本页面已有新版，请刷新后再清理。');
    if(status.windows>1)throw new Error('请先关闭其他学习室标签页或窗口，再清理存储。');
  }
  async clearAudio(){
    const names=await caches.keys();for(const name of names){if(AUDIO_CACHE.test(name)){await caches.delete(name);continue;}if(!VERSION_CACHE.test(name))continue;const cache=await caches.open(name),response=await cache.match(new URL('release.json',this.base));let manifest;try{manifest=await response?.json();}catch{}
      if(Array.isArray(manifest?.audio)){let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<manifest.audio.length){const path=manifest.audio[cursor++].path;if(/^audio\/[a-f0-9]{64}\.(mp3|ogg|wav)$/.test(path))await cache.delete(new URL(path,this.base));}}));}await cache.delete(new URL('offline-ready',this.base));
    }
    // Checkpoint is public metadata, never the learning database or login storage.
    await (await caches.open(META_CACHE)).delete(new URL('offline-checkpoint.json',this.base));
  }
  async compact(onProgress=()=>{}){
    const names=await caches.keys(),versions=names.filter(n=>VERSION_CACHE.test(n)),assets=[...this.release.shell,...this.release.audio];let cursor=0,moved=0,checked=0;
    const worker=async()=>{while(cursor<assets.length){const asset=assets[cursor++],found=await cachedAsset(this.current,this.base,asset);if(found){const target=isAudio(asset)?audioCacheName(asset):this.current;if(target!==found.name){await (await caches.open(target)).put(new URL(asset.path,this.base),new Response(found.bytes,{headers:{'Content-Type':asset.type}}));moved++;}}checked++;if(checked%100===0)onProgress({checked,total:assets.length});}};const results=await Promise.allSettled(Array.from({length:4},worker)),failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
    if(this.registration)await this.guard(this.registration);
    // Only delete old versions after all reusable files have been copied successfully.
    for(const name of versions)if(name!==this.current)await caches.delete(name);
    const current=await caches.open(this.current);for(const asset of this.release.audio)await current.delete(new URL(asset.path,this.base));
    const wanted=new Set(this.release.audio.map(a=>new URL(a.path,this.base).href));for(const name of (await caches.keys()).filter(n=>AUDIO_CACHE.test(n))){const cache=await caches.open(name);for(const request of await cache.keys())if(!wanted.has(request.url))await cache.delete(request);}
    return {moved,removedVersions:versions.filter(n=>n!==this.current).length};
  }
}
