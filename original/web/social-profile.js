import {catArtHtml} from './cat-art.js';
export function avatarHtml(value,esc,label='头像'){
 if(/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value||'')&&value.length<=200000)return `<img class="social-avatar" src="${esc(value)}" alt="${esc(label)}">`;
 const cat=/^cat:([0-4])$/.exec(value||'')?.[1]||'0';
 return catArtHtml(Number(cat),0,'cat-sprite social-avatar',esc(label));
}
export function profileValues(nickname,avatar){
 const name=String(nickname||'').trim();if(!name||name.length>20)throw Error('昵称请填写 1—20 个字。');
 if(!/^cat:[0-4]$/.test(avatar||'')&&!(avatar?.length<=200000&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(avatar)))throw Error('请选择小猫头像，或重新上传头像照片。');
 return {p_nickname:name,p_avatar:avatar};
}
export function initAccountProfile({request,getUser,openModal,toast,esc,onSaved}){
 let cached=null,avatar='cat:0',loading=false;
 const rpc=(name,body={})=>request('rest/v1/rpc/miaoye_social_'+name,{method:'POST',body:JSON.stringify(body)});
 function card(username){const profile=cached?.id===getUser()?.id?cached:null;return `<div class="social-person">${avatarHtml(profile?.avatar||'cat:0',esc)}<div><strong>${esc(profile?.nickname||username)}</strong><p class="small muted">喵页用户名：${esc(username)}</p></div></div>`;}
 function updatePreview(){const slot=document.querySelector('#account-avatar-preview');if(slot)slot.innerHTML=avatarHtml(avatar,esc,'我的头像');}
 async function edit(){
  if(!getUser())throw Error('请先登录云账号。');cached=await rpc('me');avatar=cached.avatar||'cat:0';
  openModal(`<h2>我的头像和昵称</h2><form id="account-profile" novalidate><div id="account-avatar-preview">${avatarHtml(avatar,esc,'我的头像')}</div><label class="button secondary" for="account-avatar-file">从相册选择头像</label><input id="account-avatar-file" type="file" accept="image/*" hidden><p class="small muted">照片仅作为头像上传，选择后会裁成方形小图。也可以使用小猫头像。</p><div class="avatar-choices">${[0,1,2,3,4].map(cat=>`<button type="button" class="avatar-choice" data-account-cat="${cat}" aria-label="使用第 ${cat+1} 只小猫头像">${avatarHtml('cat:'+cat,esc)}</button>`).join('')}</div><label class="field-label" for="account-nickname">昵称（最多 20 个字）</label><input id="account-nickname" class="input" name="nickname" maxlength="20" value="${esc(cached.nickname||cached.username)}"><p class="small muted">昵称和头像会显示在你分享给好友的动态中，登录用户名保持不变。</p><p id="account-profile-feedback" role="status"></p><button class="button primary wide" type="submit">保存头像和昵称</button></form>`);
 }
 document.addEventListener('click',event=>{const button=event.target.closest('[data-account-cat]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(loading)return;avatar='cat:'+button.dataset.accountCat;updatePreview();},true);
 document.addEventListener('change',async event=>{
  if(event.target.id!=='account-avatar-file')return;const file=event.target.files?.[0];if(!file||loading)return;
  const feedback=document.querySelector('#account-profile-feedback');loading=true;
  try{
   if(!file.type.startsWith('image/')||file.size>10*1024*1024)throw Error('请选择不超过 10 MB 的照片。');
   const bitmap=await createImageBitmap(file);try{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),size=Math.min(bitmap.width,bitmap.height);c.fillStyle='#fffbed';c.fillRect(0,0,128,128);c.drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,128,128);avatar=canvas.toDataURL('image/jpeg',.85);profileValues('头像',avatar);}finally{bitmap.close();}
   updatePreview();feedback.textContent='头像已准备好，点击保存才会上传。';
  }catch(error){feedback.textContent='头像处理失败：'+error.message;}finally{loading=false;}
 },true);
 document.addEventListener('submit',async event=>{
  if(event.target.id!=='account-profile')return;event.preventDefault();event.stopImmediatePropagation();if(loading)return;
  const form=event.target,button=form.querySelector('[type="submit"]'),feedback=form.querySelector('#account-profile-feedback');
  loading=true;button.disabled=true;
  try{const payload=profileValues(new FormData(form).get('nickname'),avatar);feedback.textContent='正在保存…';cached=await rpc('profile',payload);toast('头像和昵称已更新。');onSaved();}catch(error){feedback.textContent=error.message;}finally{loading=false;button.disabled=false;}
 },true);
 async function refreshCard(){const value=await rpc('me');if(value.id!==getUser()?.id)return;cached=value;const slot=document.querySelector('#cloud-profile-card');if(slot)slot.innerHTML=card(value.username);}
return {edit,card,refreshCard};
}
