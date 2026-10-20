import { cachedAsset,isAudio,audioCacheName,assetHash } from './resource-cache.js';
// Session-only LRU: faster replay, with no additional persistent audio download.
const recent=new Map();let recentBytes=0;const MAX_BYTES=8*1024*1024;
function remember(key,bytes){const prior=recent.get(key);if(prior)recentBytes-=prior.byteLength;recent.delete(key);if(bytes.byteLength>MAX_BYTES)return;recent.set(key,bytes);recentBytes+=bytes.byteLength;while(recentBytes>MAX_BYTES||recent.size>24){const first=recent.keys().next().value;recentBytes-=recent.get(first).byteLength;recent.delete(first);}}

// Public files only. Audio can be played without retaining another local copy.
export async function publicAsset(cacheName,base,asset,{save=true,required=false,fetcher=globalThis.fetch.bind(globalThis),onNetwork=()=>{},signal}={}) {
  if(!asset||typeof asset.path!=='string'||!/^[a-f0-9]{64}$/.test(asset.sha256)||!Number.isInteger(asset.bytes)||asset.bytes<=0)throw new Error('公开资源清单无效。');
  const url=new URL(asset.path,base);
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||url.search||url.hash)throw new Error('公开资源地址无效。');
  const valid=async response=>{if(!response)return null;const bytes=await response.arrayBuffer();return bytes.byteLength===asset.bytes&&await assetHash(bytes)===asset.sha256?bytes:null;};
  const key=url.href+'|'+asset.sha256+'|'+asset.bytes;
  const memory=isAudio(asset)?recent.get(key):null,found=memory?{bytes:memory,name:null}:await cachedAsset(cacheName,base,asset),target=isAudio(asset)?audioCacheName(asset):cacheName;let bytes=found?.bytes;
  if(!bytes){
    if(navigator.onLine===false)throw new Error('这项内容尚未离线保存。联网后可直接使用，也可提前下载离线包。');
    // Bypass a corrupt response in an older service worker's public cache.
    const network=new URL(url);network.searchParams.set('verified',asset.sha256);
    const timeout=AbortSignal.timeout(60000),requestSignal=signal?(AbortSignal.any?AbortSignal.any([signal,timeout]):signal):timeout;
    let response;try{response=await fetcher(network,{cache:'no-store',credentials:'omit',signal:requestSignal});}catch{if(signal?.aborted)throw new DOMException('Audio request cancelled','AbortError');throw new Error('暂时无法加载这项内容，请联网重试；学习进度仍在本机。');}
    if(!response.ok)throw new Error('这项内容暂时无法加载，请稍后重试。');
    bytes=await valid(response);if(!bytes)throw new Error('内容校验失败，未使用该文件，请重试。');onNetwork(asset);
  }
  const response=new Response(bytes,{headers:{'Content-Type':asset.type||'application/json'}});
  if(isAudio(asset))remember(key,bytes);
  if(save&&found?.name!==target)try{await (await caches.open(target)).put(url,response.clone());}catch(error){if(required||error.name!=='QuotaExceededError')throw error;}
  return response;
}
