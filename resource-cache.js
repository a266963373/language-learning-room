import { sha256 } from './crypto.js';
export const VERSION_CACHE=/^language-room-multi-[a-f0-9]{20}$/;
export const AUDIO_CACHE=/^language-room-multi-audio-[a-f0-9]{2}$/;
export const META_CACHE='language-room-multi-storage-v1';
export const audioCacheName=asset=>'language-room-multi-audio-'+asset.sha256.slice(0,2);
export const isAudio=asset=>asset.path.startsWith('audio/');
export async function cachedAsset(current,base,asset) {
  const names=await caches.keys(),preferred=isAudio(asset)?[audioCacheName(asset),current]:[current];
  for(const name of new Set([...preferred,...names.filter(name=>VERSION_CACHE.test(name))])){
    if(!names.includes(name))continue;
    const response=await (await caches.open(name)).match(new URL(asset.path,base));if(!response)continue;
    const bytes=await response.arrayBuffer();if(bytes.byteLength===asset.bytes&&sha256(bytes)===asset.sha256)return {bytes,name};
  }
  return null;
}
export async function resourceLock(callback) {
  if(!navigator.locks)throw new Error('请升级浏览器后管理离线存储；在线学习仍可继续。');
  return navigator.locks.request('language-room-multi-resources',{ifAvailable:true},lock=>{if(!lock)throw new Error('另一个学习室页面正在下载或整理，请稍后再试。');return callback();});
}
