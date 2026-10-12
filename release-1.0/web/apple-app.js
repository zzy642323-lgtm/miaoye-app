(()=>{
const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.MIAOYE_APPLE=apple;if(apple)document.body.classList.add('apple-app');
const standalone=()=>navigator.standalone||matchMedia('(display-mode: standalone)').matches;
window.MiaoyeWebExport={savePng(png){
 const parts=png.split(','),bytes=Uint8Array.from(atob(parts[1]),c=>c.charCodeAt(0));
 const file=new File([bytes],'喵页照片.png',{type:'image/png'});
 const url=URL.createObjectURL(file);
 show('保存照片','<p class="dialog-sub">点分享后选择「存储图像」，保存到苹果照片图库。</p><img class="apple-save-preview" alt="待保存照片"><button class="primary" data-apple-share>分享并保存照片</button><button class="record-secondary" data-close>取消</button>');
 const image=document.querySelector('.apple-save-preview');image.src=url;
 document.querySelector('[data-apple-share]').onclick=async()=>{
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file]});panel.close()}else{show('保存照片','<p class="dialog-sub">长按下面的图片，选择「存储到照片」。</p><img class="apple-save-preview" alt="待保存照片">');document.querySelector('.apple-save-preview').src=png}}
  catch(error){if(error.name!=='AbortError')toast('请长按图片，选择存储到照片')}
 };
 panel.addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});
}};
document.addEventListener('click',async e=>{
 const a=e.target.closest('a[download]');if(!apple||window.MIAOYE_ANDROID||!a||!/^blob:|^data:image\/png/.test(a.href))return;
 e.preventDefault();
 try{const blob=await(await fetch(a.href)).blob();const reader=new FileReader();reader.onload=()=>MiaoyeWebExport.savePng(reader.result);reader.readAsDataURL(blob)}catch{toast('图片读取失败，请重试')}
},true);
document.addEventListener('click',e=>{
 if(!e.target.closest('[data-apple-install]'))return;
 show('把喵页放到主屏幕','<p class="dialog-sub">使用 Safari 打开喵页，点击分享按钮，选择「添加到主屏幕」，然后点击「添加」。下次点喵页图标，就能直接打开。</p><button class="primary" data-close>知道啦</button>');
});
if(apple&&!standalone())document.addEventListener('DOMContentLoaded',()=>{
 const support=document.querySelector('.profile-support');if(support&&!support.querySelector('[data-apple-install]'))support.insertAdjacentHTML('beforeend','<button data-apple-install><span>添加到主屏幕</span><small>像 APP 一样打开 ↗</small></button>');
});
if('serviceWorker' in navigator&&!window.MIAOYE_ANDROID&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
document.head.insertAdjacentHTML('beforeend','<style>.apple-save-preview{display:block;max-width:100%;max-height:45dvh;object-fit:contain;margin:16px auto;-webkit-touch-callout:default}.apple-app.single .phone{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}.apple-app input,.apple-app textarea{font-size:max(16px,1em)}.apple-app.single .nav{bottom:calc(12px + env(safe-area-inset-bottom))}</style>');
})();
