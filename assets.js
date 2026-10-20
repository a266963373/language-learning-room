import { sha256 } from './crypto.js';

// Public files only. Audio can be played without retaining another local copy.
export async function publicAsset(cacheName,base,asset,{save=true,required=false,fetcher=globalThis.fetch.bind(globalThis)}={}) {
  if(!asset||typeof asset.path!=='string'||!/^[a-f0-9]{64}$/.test(asset.sha256)||!Number.isInteger(asset.bytes)||asset.bytes<=0)throw new Error('公开资源清单无效。');
  const url=new URL(asset.path,base);
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||url.search||url.hash)throw new Error('公开资源地址无效。');
  const cache=await caches.open(cacheName),current=await cache.match(url);
  const valid=async response=>{if(!response)return null;const bytes=await response.arrayBuffer();return bytes.byteLength===asset.bytes&&sha256(bytes)===asset.sha256?bytes:null;};
  let bytes=await valid(current);
  if(bytes)return new Response(bytes,{headers:{'Content-Type':asset.type||'application/json'}});
  for(const name of await caches.keys()){if(bytes)break;if(name!==cacheName&&name.startsWith('language-room-multi-'))bytes=await valid(await (await caches.open(name)).match(url));}
  if(!bytes){
    if(navigator.onLine===false)throw new Error('这项内容尚未离线保存。联网后可直接使用，也可提前下载离线包。');
    // Bypass a corrupt response in an older service worker's public cache.
    const network=new URL(url);network.searchParams.set('verified',asset.sha256);
    let response;try{response=await fetcher(network,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(60000)});}catch{throw new Error('暂时无法加载这项内容，请联网重试；学习进度仍在本机。');}
    if(!response.ok)throw new Error('这项内容暂时无法加载，请稍后重试。');
    bytes=await valid(response);if(!bytes)throw new Error('内容校验失败，未使用该文件，请重试。');
  }
  const response=new Response(bytes,{headers:{'Content-Type':asset.type||'application/json'}});
  if(save)try{await cache.put(url,response.clone());}catch(error){if(required||error.name!=='QuotaExceededError')throw error;}
  return response;
}
