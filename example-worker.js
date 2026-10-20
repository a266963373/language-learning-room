// Read-only selection: expensive sentence matching never runs on the UI thread.
import {OfflineEngine} from './engine.js';
import {openDatabase} from './store.js';
import {publicAsset} from './assets.js';
const base=new URL('./',import.meta.url);let database,current;
self.onmessage=async({data})=>{
 try{
  const {id,languageId,version,asset,sessionId,taskId}=data;
  if(!current||current.languageId!==languageId||current.version!==version){
   const pack=await(await publicAsset('language-room-multi-'+version,base,asset)).json();
   database??=await openDatabase();
   const engine=new OfflineEngine(database,{version,languages:{[languageId]:pack},audio:pack.audio},base);
   engine.loadedLanguage=languageId;current={languageId,version,engine};
  }
  const engine=current.engine;await engine.store.refresh();
  // These history indexes are not used by a read-only word-example query.
  delete engine.store.state.receipts;delete engine.store.state.requests;delete engine.store.state.undoRequests;
  const result=engine.learning.wordExample(sessionId,taskId);
  self.postMessage({id,result});
 }catch(error){self.postMessage({id:data.id,error:{status:error.status??500,code:error.code??'example_unavailable',message:error.message}});}
};
