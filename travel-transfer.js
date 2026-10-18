// The desktop app exports through its existing same-origin, loopback-only API.
if(!window.multiOffline&&!window.englishOffline) {
  const controls=document.createElement('section');controls.className='panel-section';
  const heading=document.createElement('h3');heading.textContent='出门时接着学';
  const note=document.createElement('p');note.className='panel-note';note.textContent='导出九语进度、复习安排、当前练习、草稿和私人录音。备份只下载到本机，再到旅行版导入；不要上传公开仓库。';
  const button=document.createElement('button');button.type='button';button.id='export-travel-backup';button.textContent='导出九语旅行备份';
  const status=document.createElement('p');status.className='panel-note';status.setAttribute('role','status');
  button.onclick=async()=>{button.disabled=true;try{const response=await fetch('/api/travel/backup');if(!response.ok)throw new Error('导出暂不可用，请刷新或重新启动学习室后重试。');const payload=await response.json();try{payload.ui=JSON.parse(localStorage.getItem('language-room-ui')||'{}');}catch{}const blob=new Blob([JSON.stringify(payload)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`language-room-travel-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='已导出。请将备份保存到你的私人文件位置，再导入旅行版。';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}};
  controls.append(heading,note,button,status);document.querySelector('#settings-body')?.before(controls);
}
