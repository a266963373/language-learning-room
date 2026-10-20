export class ExampleReader {
 constructor(engine,base){this.engine=engine;this.base=base;this.serial=0;}
 select(sessionId,taskId){
  const key=sessionId+':'+taskId;
  if(this.active?.key===key)return this.active.promise;
  if(this.pending?.key===key)return this.pending.promise;
  if(this.pending)this.pending.reject(new DOMException('Obsolete example','AbortError'));
  let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const job={key,sessionId,taskId,resolve,reject,promise,id:++this.serial};
  if(this.active)this.pending=job;else this.start(job);return promise;
 }
 start(job){
  this.active=job;
  try{
   if(!this.worker){
    this.worker=new Worker(new URL('example-worker.js',this.base),{type:'module'});
    this.worker.onmessage=({data})=>{const active=this.active;if(!active||data.id!==active.id)return;if(data.error)active.reject(Object.assign(new Error(data.error.message),data.error));else active.resolve(data.result);this.active=null;const next=this.pending;this.pending=null;if(next)this.start(next);};
    this.worker.onerror=()=>this.fail(new Error('例句后台暂不可用，可继续学习。'));
   }
   const session=this.engine.store.state.sessions[job.sessionId],languageId=session?.languageId;
   if(!languageId)throw Object.assign(new Error('学习题目已更换。'),{status:409,code:'task_conflict'});
   this.worker.postMessage({id:job.id,sessionId:job.sessionId,taskId:job.taskId,languageId,version:this.engine.document.version,asset:this.engine.document.languages[languageId].asset});
  }catch(error){this.fail(error);}
 }
 fail(error){this.worker?.terminate();this.worker=null;this.active?.reject(error);this.pending?.reject(error);this.active=null;this.pending=null;}
 async handle(url){
  try{return new Response(JSON.stringify(await this.select(url.searchParams.get('sessionId'),url.searchParams.get('taskId'))),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
  catch(error){return new Response(JSON.stringify({error:{code:error.code??'example_unavailable',message:error.message}}),{status:error.status??503,headers:{'Content-Type':'application/json'}});}
 }
}
