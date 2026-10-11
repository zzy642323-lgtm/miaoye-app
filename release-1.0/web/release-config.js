(()=>{window.MIAOYE_VERSION='1.0.3';window.MIAOYE_ANDROID=typeof window.MiaoyeCloud?.request==='function';if(!localStorage.getItem('miaoye-preview-onboarded'))localStorage.setItem('miaoye-preview-empty-start','1');if(!localStorage.getItem('miaoye-preview-cleared-v022')){const cleanup=indexedDB.deleteDatabase('miaoye-journal');cleanup.onsuccess=()=>{for(const key of Object.keys(localStorage))if(key.startsWith('miaoye-')&&!key.startsWith('miaoye-preview-'))localStorage.removeItem(key);localStorage.setItem('miaoye-preview-cleared-v022','1')}}const originalFetch=window.fetch.bind(window);let sequence=0;
const pending=new Map();
async function cloudFetch(url,options={}){
  const host=globalThis.window;
  if(!host?.MIAOYE_ANDROID||typeof host.MiaoyeCloud?.request!=='function')return originalFetch(url,options);
  const target=new URL(url);
  if(target.origin!=='https://s7ianzbg94fw.meoo.run'||!target.pathname.startsWith('/cloud/')||target.username||target.password||target.hash)throw Error('不支持的云请求地址');
  const body=options.body instanceof Blob?await options.body.text():String(options.body??'');
  const headers={};new Headers(options.headers).forEach((value,key)=>{const name={'authorization':'Authorization','content-type':'Content-Type','prefer':'Prefer','x-upsert':'X-Upsert'}[key];if(name)headers[name]=value;});
  host.miaoyeCloudReply=(id,result)=>pending.get(id)?.(result);
  return new Promise((resolve,reject)=>{
    const id='cloud_'+Date.now()+'_'+(++sequence),signal=options.signal;
    const cleanup=()=>{pending.delete(id);signal?.removeEventListener('abort',abort);};
    const abort=()=>{cleanup();reject(new DOMException('请求已取消','AbortError'));};
    if(signal?.aborted)return abort();
    pending.set(id,result=>{
      cleanup();
      if(!result||!Number.isInteger(result.status)||result.status<200||result.status>599)return reject(Error(result?.error||'云服务没有返回有效响应，请稍后重试。'));
      resolve(new Response(result.status===204?null:result.body||'',{status:result.status}));
    });
    signal?.addEventListener('abort',abort,{once:true});
    try{host.MiaoyeCloud.request(id,target.href,options.method||'GET',JSON.stringify(headers),body);}catch(error){cleanup();reject(Error('安卓云连接未能启动，请更新应用后重试。'));}
  });
}

window.fetch=(url,options)=>window.MIAOYE_ANDROID&&String(url).startsWith('https://s7ianzbg94fw.meoo.run/cloud/')?cloudFetch(url,options):originalFetch(url,options);document.addEventListener('click',async e=>{const a=e.target.closest('a[download]');if(!window.MIAOYE_ANDROID||!a||!a.href.startsWith('blob:')&&!a.href.startsWith('data:image/png'))return;e.preventDefault();const blob=await(await originalFetch(a.href)).blob(),reader=new FileReader();reader.onload=()=>MiaoyeExport.savePng(reader.result);reader.readAsDataURL(blob)},true)})();