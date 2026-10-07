import {cloudFetch} from './cloud-transport.js';
const BASE='https://s7ianzbg94fw.meoo.run/cloud/';
const SESSION='miaoye-cloud-session', OWNER='miaoye-cloud-owner', AUTO='miaoye-cloud-auto';
const KEYS=['books','records','draft','cat','credits','lastActivity','catLife','catNames','starterCat','activeBook','deletedBooks'];
export async function cloudJson(url,options={},timeout=120000){
  // Android WebViews before Chromium 124 do not provide AbortSignal.timeout.
  const controller=new AbortController();let expired=false;
  const timer=setTimeout(()=>{expired=true;controller.abort();},timeout);
  try{
    const response=await cloudFetch(url,{...options,signal:controller.signal});
    let data;try{data=await response.json();}catch{data={};}
    if(!response.ok){
      const code=data.error_code||data.code,raw=data.msg||data.error_description||data.message||data.error;
      if(code==='invalid_credentials'||/invalid login credentials/i.test(raw||''))throw Error('用户名或密码不正确，请检查后重试。');
      if(code==='user_already_exists'||/already registered/i.test(raw||''))throw Error('这个用户名已经注册，请直接登录或换一个用户名。');
      if(response.status===429)throw Error('操作太频繁，请稍等一分钟再试。');
      throw Error(raw||'云端操作失败（'+response.status+'），请稍后重试。');
    }
    return data;
  }catch(error){
    if(expired)throw Error('云服务响应超时，请稍后重试；本机手账仍保留。');
    if(error instanceof TypeError)throw Error('云连接未完成，请稍后重试；若持续出现，请更新应用并记录报错。');
    throw error;
  }finally{clearTimeout(timer);}
}
export function cloudCredentials(username,password){
  const name=String(username||'').trim().toLowerCase();
  if(!/^[a-z0-9_]{3,32}$/.test(name))throw Error('用户名请用 3—32 位英文字母、数字或下划线，例如 miaoye_123；暂不支持中文、邮箱或空格。');
  if(typeof password!=='string'||password.length<8)throw Error('密码至少需要 8 位，请补全后再试。');
  return {email:name+'@meoo.local',password,data:{username:name}};
}
export function validateBackup(value){
  if(value?.format!=='miaoye-backup'||value.version!==1||!value.journal||!Array.isArray(value.journal.books)||!Array.isArray(value.journal.records)||value.journal.books.length>100||value.journal.records.length>10000)throw Error('这份备份格式不受支持，本机内容没有改变。');
  const clean={id:'v2-state'};for(const key of KEYS)if(value.journal[key]!==undefined)clean[key]=value.journal[key];return clean;
}
export function initCloudBackup({local,openModal,toast,esc}){
  let session;try{session=JSON.parse(localStorage.getItem(SESSION)||'null');}catch{}
  let busy=false,timer,status='未备份',lastHash='';
  let device=localStorage.getItem('miaoye-cloud-device');if(!device){device=crypto.randomUUID();localStorage.setItem('miaoye-cloud-device',device);}
  function remember(s){session=s;if(s)localStorage.setItem(SESSION,JSON.stringify(s));else localStorage.removeItem(SESSION);}
  async function request(path,options={},auth=true){
    if(auth){if(!session)throw Error('请先登录。');if((session.expires_at||0)<Date.now()/1000+60){const s=await request('auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})},false);remember({...s,expires_at:Date.now()/1000+s.expires_in});}}
    return cloudJson(BASE+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer '+session.access_token}:{}),...options.headers}},auth?120000:90000);
  }
  async function list(){return request('rest/v1/miaoye_backups?select=*&order=created_at.desc&limit=100');}
  async function backup(enable=false){
    if(busy)return;if(!session)throw Error('请先登录。');
    const owner=localStorage.getItem(OWNER);if(owner&&owner!==session.user.id)throw Error('本机手账属于另一个云账号，请登录原来的账号后备份。');
    busy=true;status='备份中';
    try{
      const journal=(await local('getAll')).find(x=>x.id==='v2-state');if(!journal)throw Error('请先保存一篇手账。');
      const body=JSON.stringify({format:'miaoye-backup',version:1,journal});validateBackup(JSON.parse(body));
      const blob=new Blob([body],{type:'application/json'});if(blob.size>50*1024*1024)throw Error('本机内容超过 50 MB，暂不能整本备份。');
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('');
      if(hash===lastHash){status='云端已是最新';if(enable)localStorage.setItem(AUTO,'true');return;}
      const id=crypto.randomUUID(),path=session.user.id+'/'+device+'/'+id+'.json';
      await request('storage/v1/object/miaoye-private/'+path,{method:'POST',body:blob});
      try{await request('rest/v1/miaoye_backups',{method:'POST',body:JSON.stringify({id,user_id:session.user.id,device_id:device,path,bytes:blob.size,entries:journal.records.length})});}
      catch(error){await request('storage/v1/object/miaoye-private/'+path,{method:'DELETE'}).catch(()=>{});throw error;}
      localStorage.setItem(OWNER,session.user.id);if(enable)localStorage.setItem(AUTO,'true');lastHash=hash;status='最近备份：'+new Date().toLocaleString();localStorage.setItem('miaoye-cloud-last',status);
      // Cleanup only this device's old copies, after the new index committed successfully.
      const copies=(await list()).filter(x=>x.device_id===device);
      for(const old of copies.slice(3)){await request('storage/v1/object/miaoye-private/'+old.path,{method:'DELETE'});await request('rest/v1/miaoye_backups?id=eq.'+old.id,{method:'DELETE'});}
      if(enable)toast('已私密备份，自动备份已开启。');
    }finally{busy=false;}
  }
  function changed(){clearTimeout(timer);if(session&&localStorage.getItem(AUTO)==='true'&&localStorage.getItem(OWNER)===session.user.id)timer=setTimeout(()=>backup().catch(error=>{status=error.message;}),30000);}
  function panel(){
    const signed=!!session;
    openModal(`<h2>云端收好小日子</h2><p class="muted">照片、手账、草稿和猫咪进度私密保存到秒悟。离线仍可记录，每台设备保留最近 3 份备份。</p>${signed?`<p>${esc(session.user.email?.replace(/@meoo\.local$/,'')||'已登录')}</p><p class="small muted">${esc(status==='未备份'?localStorage.getItem('miaoye-cloud-last')||status:status)}</p><button class="button primary wide" data-cloud="backup">备份本机手账并开启自动备份</button><button class="button secondary wide" data-cloud="list">查看云端备份 / 换手机恢复</button><button class="text-button" data-cloud="pause">${localStorage.getItem(AUTO)==='true'?'暂停自动备份':'自动备份未开启'}</button><button class="text-button" data-cloud="logout">退出云账号（保留本机手账）</button>`:`<form id="cloud-login" novalidate><label class="field-label">用户名（3—32 位字母、数字或下划线）</label><input class="input" name="username" pattern="[A-Za-z0-9_]{3,32}" minlength="3" maxlength="32" autocomplete="username" required><label class="field-label">密码（至少 8 位）</label><input class="input" name="password" type="password" minlength="8" autocomplete="current-password" required><p id="cloud-feedback" class="small muted" role="status" aria-live="polite">填写用户名和密码，然后选择登录或注册。</p><button type="submit" class="button primary wide" name="mode" value="login">登录云账号</button><button type="submit" class="button secondary wide" name="mode" value="signup">注册云账号</button></form><p class="small muted">用户名与密码登录，无需邮件或短信验证码。请记好账号和密码。</p>`}<button class="text-button" data-action="reset-local">清空本机内容 / 重新开始</button><p class="small muted">整个备份上限 50 MB；项目免费存储合计 1 GB。首次备份由你主动开启，不会自动上传未授权的本机内容。</p>`);
  }
  document.addEventListener('click',async event=>{
    const profile=event.target.closest('[data-action="profile"]');
    if(profile&&(window.MIAOYE_ANDROID||window.MIAOYE_STANDALONE)){event.stopImmediatePropagation();panel();return;}
    const button=event.target.closest('[data-cloud]');if(!button)return;event.stopImmediatePropagation();if(busy)return toast('正在备份，请稍等完成。');button.disabled=true;
    try{
      const action=button.dataset.cloud;
      if(action==='backup'){await backup(true);panel();}
      if(action==='pause'){localStorage.removeItem(AUTO);clearTimeout(timer);toast('已暂停自动备份。');panel();}
      if(action==='logout'){await request('auth/v1/logout',{method:'POST'}).catch(()=>{});clearTimeout(timer);remember(null);localStorage.removeItem(AUTO);panel();}
      if(action==='list'){
        const copies=await list();
        openModal('<h2>你的云端备份</h2><p class="muted">恢复会替换本机手账。操作前会在本机保留一份恢复前副本。</p>'+copies.slice(0,20).map(x=>`<button class="button secondary wide" data-cloud="restore" data-backup="${esc(x.id)}">${esc(new Date(x.created_at).toLocaleString())} · ${x.entries} 篇 · ${(x.bytes/1048576).toFixed(1)} MB</button>`).join('')+(copies.length?'':'<p>还没有备份。请在记录手账的手机上先登录并备份。</p>')+'<button class="text-button" data-cloud="rollback">恢复本机的恢复前副本</button>');
      }
      if(action==='restore'){
        const copies=await list(),copy=copies.find(x=>x.id===button.dataset.backup);if(!copy)throw Error('备份已不存在，请刷新列表。');
        openModal(`<h2>恢复这份云端备份？</h2><p class="muted">${esc(new Date(copy.created_at).toLocaleString())}，${copy.entries} 篇手账。本机现有内容会替换，恢复前副本会保留在手机里。</p><button class="button primary wide" data-cloud="confirm-restore" data-backup="${esc(copy.id)}">确认恢复</button>`);
      }
      if(action==='confirm-restore'){
        const copy=(await list()).find(x=>x.id===button.dataset.backup);if(!copy)throw Error('备份已不存在。');
        const clean=validateBackup(await request('storage/v1/object/authenticated/miaoye-private/'+copy.path));
        const before=(await local('getAll')).find(x=>x.id==='v2-state');if(before)await local('put',{...before,id:'cloud-before-restore',backupOwner:localStorage.getItem(OWNER)});
        clearTimeout(timer);localStorage.removeItem(AUTO);await local('put',clean);localStorage.setItem(OWNER,session.user.id);location.reload();
      }
      if(action==='rollback'){const old=(await local('getAll')).find(x=>x.id==='cloud-before-restore');if(!old)throw Error('本机没有恢复前副本。');clearTimeout(timer);localStorage.removeItem(AUTO);await local('put',{...old,id:'v2-state'});if(old.backupOwner)localStorage.setItem(OWNER,old.backupOwner);else localStorage.removeItem(OWNER);location.reload();}
    }catch(error){status=error.message;toast(error.message);button.disabled=false;}
  },true);
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='cloud-login')return;event.preventDefault();event.stopImmediatePropagation();const form=event.target,values=Object.fromEntries(new FormData(form)),mode=event.submitter?.value||'login';const buttons=form.querySelectorAll('button'),feedback=form.querySelector('#cloud-feedback');
    if(form.dataset.pending==='true')return;
    const show=message=>{if(feedback)feedback.textContent=message;};
    try{
      const credentials=cloudCredentials(values.username,values.password);
      form.dataset.pending='true';buttons.forEach(b=>b.disabled=true);show(mode==='signup'?'正在注册，请稍等…':'正在登录，请稍等…');
      const s=await request(mode==='signup'?'auth/v1/signup':'auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify(credentials)},false);
      if(!s.access_token||!s.user?.id)throw Error('云账号未完成登录，请稍后重试。');
      remember({...s,expires_at:Date.now()/1000+s.expires_in});status='已登录，尚未上传本机内容';panel();
    }catch(error){show(error.message);toast(error.message);}finally{form.dataset.pending='false';buttons.forEach(b=>b.disabled=false);}
  },true);
  window.addEventListener('online',changed);changed();return {changed,panel,request,getUser:()=>session?.user||null};
}
