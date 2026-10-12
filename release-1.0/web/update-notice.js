(()=>{
const version=window.MIAOYE_VERSION,KEY='miaoye-preview-update-seen';let layer=null,observer;
if(!version||localStorage.getItem(KEY)===version)return;
const changes=['好友卡片分别展示已贴上的照片，保留抠图白边；翻开后查看整页手账。','头像和昵称同步到云端，在好友列表和好友手账里展示。','长按手账图片，可选择保存到手机图库。','切换卡片自动换一句小猫回复，没有关键词也有十五句默认回应。','版本页可以检查更新、下载安装包，并查看下载失败原因。'];
function attempt(){
 if(layer||document.querySelector('.onboarding,.account-start,.first-guide,.record-flow,dialog[open]')||!localStorage.getItem('miaoye-preview-onboarded'))return;
 layer=document.createElement('div');layer.className='update-notice';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','本次更新说明');
 layer.innerHTML='<section><small>MIAOYE / UPDATE</small><h2>又见面啦</h2><p>喵页 '+version+' · 这次更新</p><ul>'+changes.map(text=>'<li>'+text+'</li>').join('')+'</ul><button type="button">知道了，继续记录</button></section>';
 layer.querySelector('button').onclick=()=>{localStorage.setItem(KEY,version);layer.remove();observer.disconnect()};document.body.append(layer);
}
document.head.insertAdjacentHTML('beforeend','<style>.update-notice{position:fixed;inset:0;z-index:155;background:#29282488;display:grid;place-items:center;padding:24px}.update-notice section{width:min(100%,360px);max-height:90dvh;overflow:auto;background:#fffaf0;border-radius:28px;padding:26px;color:#292824;box-shadow:0 12px 40px #0002}.update-notice small{font-size:10px;letter-spacing:.15em;color:#8a8170}.update-notice h2{font-size:26px;margin:14px 0 8px}.update-notice p{font-size:12px;color:#8a8170}.update-notice ul{padding-left:18px;margin:20px 0;font-size:13px;line-height:1.75}.update-notice li+li{margin-top:9px}.update-notice button{display:block;width:100%;border:0;border-radius:24px;padding:14px;background:#edcd56;font-size:14px}</style>');
observer=new MutationObserver(attempt);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('miaoye-auth-ready',attempt);attempt();
})();
