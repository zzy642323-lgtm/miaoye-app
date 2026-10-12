(()=>{
let generation=0,queue=Promise.resolve();
const OWNER='miaoye-preview-profile-owner',DIRTY='miaoye-preview-profile-dirty';
async function portrait(src){
 if(!src)return 'cat:'+RecordArt.adopted().cat;
 const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('头像读取失败'));img.src=src});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),size=Math.min(img.width,img.height);ctx.fillStyle='#fffdf6';ctx.fillRect(0,0,128,128);ctx.drawImage(img,(img.width-size)/2,(img.height-size)/2,size,size,0,0,128,128);
 return canvas.toDataURL('image/jpeg',.85);
}
async function sync(edit=false){
 const account=window.MiaoYeAccount,user=account?.getUser?.(),ticket=generation;if(!user)return;
 const localOwner=localStorage.getItem(OWNER),legacy=!localOwner&&(profileState.avatar||profileState.name!=='小页');
 const name=profileState.name,avatar=profileState.avatar;
 const cloud=await account.request('rest/v1/rpc/miaoye_social_me',{method:'POST',body:'{}'});
 if(ticket!==generation||account.getUser()?.id!==user.id)return;
 if(edit||legacy||(localOwner===user.id&&localStorage.getItem(DIRTY)===user.id)){
  const picture=await portrait(avatar);if(ticket!==generation||account.getUser()?.id!==user.id)return;
  await account.request('rest/v1/rpc/miaoye_social_profile',{method:'POST',body:JSON.stringify({p_nickname:String(name||'小页').slice(0,20),p_avatar:picture})});
  if(ticket!==generation||account.getUser()?.id!==user.id)return;
  if(profileState.name===name&&profileState.avatar===avatar)localStorage.removeItem(DIRTY);
 }else{
  profileState.name=cloud.nickname||cloud.username||'小页';
  if(/^data:image\/(jpeg|png);base64,/.test(cloud.avatar||''))profileState.avatar=cloud.avatar;else delete profileState.avatar;
  localStorage.setItem('miaoye-preview-profile',JSON.stringify(profileState));
 }
 localStorage.setItem(OWNER,user.id);render();
}
function schedule(edit=false){queue=queue.catch(()=>{}).then(()=>sync(edit)).catch(error=>{toast('头像昵称暂未同步：'+error.message)});return queue}
window.addEventListener('miaoye-profile-change',()=>{const id=window.MiaoYeAccount?.getUser?.()?.id;if(!id)return;localStorage.setItem(OWNER,id);localStorage.setItem(DIRTY,id);schedule(true)});
window.addEventListener('miaoye-account-change',()=>{generation++;schedule()});
window.CloudProfile={sync:()=>schedule()};schedule();
})();
