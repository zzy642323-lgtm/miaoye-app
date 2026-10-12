(()=>{
let press=null,selected='',suppressUntil=0;
const selector='.journal-card .feed-photos img,.detail-pages img';
function cancel(){if(press)clearTimeout(press.timer);press=null}
function choose(src){selected=src;show('保存这张照片','<p class="dialog-sub">将这张照片保存到手机图库。</p><button class="primary" data-save-card-photo>保存到图库</button><button class="record-secondary" data-close>取消</button>')}
document.addEventListener('pointerdown',e=>{
 const img=e.target.closest(selector);if(!img||e.button!==0)return;cancel();
 const state={x:e.clientX,y:e.clientY,id:e.pointerId,timer:null};press=state;
 state.timer=setTimeout(()=>{if(press!==state)return;press=null;suppressUntil=Date.now()+1000;choose(img.currentSrc||img.src)},550);
});
document.addEventListener('pointermove',e=>{if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)cancel()},{passive:true});
document.addEventListener('pointerup',cancel);document.addEventListener('pointercancel',cancel);
document.addEventListener('scroll',cancel,true);
document.addEventListener('contextmenu',e=>{if(e.target.closest(selector))e.preventDefault()});
window.addEventListener('click',e=>{if(Date.now()<suppressUntil&&e.target.closest(selector)){e.preventDefault();e.stopImmediatePropagation()}},true);
document.addEventListener('click',async e=>{
 const button=e.target.closest('[data-save-card-photo]');if(!button)return;button.disabled=true;
 try{
  const img=new Image();img.src=selected;await new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.onload=resolve;img.onerror=()=>reject(Error('图片读取失败，请重试'))});
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);
  const png=canvas.toDataURL('image/png');
  if(window.MiaoyeExport?.savePng){window.MiaoyeExport.savePng(png);panel.close()}
  else if(window.MIAOYE_APPLE&&window.MiaoyeWebExport){window.MiaoyeWebExport.savePng(png)}
  else{const a=document.createElement('a');a.href=png;a.download='喵页照片-'+Date.now()+'.png';a.click();panel.close();toast('图片已下载')}
 }catch(error){toast(error.message||'图片保存失败，请重试')}finally{button.disabled=false}
});
})();
