import { sha256 } from './crypto.js';
export async function assetHash(bytes){if(globalThis.crypto?.subtle)return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');return sha256(bytes);}
export const VERSION_CACHE=/^language-room-multi-[a-f0-9]{20}$/;
export const AUDIO_CACHE=/^language-room-multi-audio-[a-f0-9]{2}$/;
export const META_CACHE='language-room-multi-storage-v1';
export const audioCacheName=asset=>'language-room-multi-audio-'+asset.sha256.slice(0,2);
export const isAudio=asset=>asset.path.startsWith('audio/');
export async function cachedAsset(current,base,asset) {
  const preferred=isAudio(asset)?[audioCacheName(asset),current]:[current];
  const check=async name=>{
    const response=await (await caches.open(name)).match(new URL(asset.path,base));if(!response)return null;
    const bytes=await response.arrayBuffer();if(bytes.byteLength===asset.bytes&&await assetHash(bytes)===asset.sha256)return {bytes,name};
    return null;
  };
  for(const name of preferred)if(await caches.has(name)){const found=await check(name);if(found)return found;}
  for(const name of (await caches.keys()).filter(name=>VERSION_CACHE.test(name)&&!preferred.includes(name))){const found=await check(name);if(found)return found;}
  return null;
}
export async function resourceLock(callback) {
  if(!navigator.locks)throw new Error('请升级浏览器后管理离线存储；在线学习仍可继续。');
  return navigator.locks.request('language-room-multi-resources',{ifAvailable:true},lock=>{if(!lock)throw new Error('另一个学习室页面正在下载或整理，请稍后再试。');return callback();});
}
