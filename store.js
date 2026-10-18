export const DB_NAME='language-room-multi-offline-v1';
export function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{request.result.createObjectStore('state');request.result.createObjectStore('recordings');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('请关闭其他学习室页面后重试。'));});}
const finished=transaction=>new Promise((resolve,reject)=>{transaction.oncomplete=resolve;transaction.onabort=()=>reject(transaction.error||new Error('保存失败，未提交评分。'));transaction.onerror=()=>{};});
export class OfflineStore{
  constructor(db,initial){this.db=db;this.initial=initial;}
  async init(){await this.transaction(s=>s);return this;}
  async refresh(){const tx=this.db.transaction('state','readonly'),done=finished(tx),read=tx.objectStore('state').get('current');read.onsuccess=()=>{this.state=read.result||this.initial();};await done;return this.state;}
  async transaction(fn,recording){
    // An IndexedDB read/write transaction serializes competing tabs. Always read
    // its current snapshot, never commit this instance's possibly stale state.
    const tx=this.db.transaction(recording?['state','recordings']:['state'],'readwrite'),done=finished(tx),table=tx.objectStore('state'),read=table.get('current');let result,callbackError,draft;
    read.onsuccess=()=>{try{draft=structuredClone(read.result||this.initial());result=fn(draft);if(result?.then)throw new Error('Offline state callbacks must be synchronous');table.put(draft,'current');if(recording)tx.objectStore('recordings').put(recording.blob,recording.id);}catch(error){callbackError=error;tx.abort();}};
    try{await done;}catch(error){throw callbackError||error;}this.state=draft;return structuredClone(result);
  }
  async recording(id){const tx=this.db.transaction('recordings','readonly'),done=finished(tx),read=tx.objectStore('recordings').get(id);let blob;read.onsuccess=()=>{blob=read.result;};await done;return blob;}
  async snapshot(){const tx=this.db.transaction(['state','recordings'],'readonly'),done=finished(tx);let state,recordings=[];const read=tx.objectStore('state').get('current');read.onsuccess=()=>{state=read.result;};const cursor=tx.objectStore('recordings').openCursor();cursor.onsuccess=()=>{const row=cursor.result;if(row){recordings.push({id:row.key,blob:row.value});row.continue();}};await done;return {state,recordings};}
  async restore(state,recordings){const tx=this.db.transaction(['state','recordings'],'readwrite'),done=finished(tx);tx.objectStore('state').put(state,'current');const table=tx.objectStore('recordings');table.clear();for(const row of recordings)table.put(row.blob,row.id);await done;this.state=structuredClone(state);}
}
