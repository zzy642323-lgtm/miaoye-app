import {adventureArt,adventurePng} from './adventure-art.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function firstBackground(){
 try{if(localStorage.getItem('miaoye-background-seen')==='1'||localStorage.getItem('miaoye-intro-seen')==='1')return Promise.resolve();}catch{}
 return new Promise(resolve=>{
  const frames=[
   ['小猫出发了','小猫离开熟悉的窗台，带着好奇心走进大大的世界。它想知道：今天会遇见什么呢？',3],
   ['世界也有温柔','路过花店时，有人留下一碗清水。小猫把遇见的善意记在心里，想寄给一个愿意听故事的人。',0],
   ['我们一起，把日子收好','于是有了喵页。你把生活照片贴进手账，小猫陪着你长大，也每隔两三天寄来自己的冒险。平凡的小日子，都值得留下。',4]
  ];
  let page=0;const dialog=document.createElement('dialog');dialog.className='intro-comic background-comic';dialog.setAttribute('aria-label','喵页的背景故事');document.body.append(dialog);
  const finish=()=>{try{localStorage.setItem('miaoye-background-seen','1');}catch{}dialog.close();dialog.remove();resolve();};
  const draw=()=>{const [title,caption,cat]=frames[page];dialog.innerHTML='<button class="intro-skip">跳过故事</button><p class="eyebrow">喵页 · 一只小猫的来信</p><img class="background-art" src="'+adventureArt(cat)+'" alt="'+esc(title)+'"><h1>'+title+'</h1><p class="comic-caption">'+caption+'</p><div class="comic-bottom"><span>'+(page+1)+' / 3</span><button class="button primary comic-next">'+(page===2?'领养我的伙伴':'下一页')+'</button></div>';dialog.querySelector('.intro-skip').onclick=finish;dialog.querySelector('.comic-next').onclick=()=>{if(page===2)finish();else{page++;draw();}};};
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});draw();dialog.showModal();
 });
}
export function showIntro(input){
 const story=input||{cat:0,name:'奶油',created:Date.now(),title:'从一碗水开始的小冒险',body:'世界很大，也有很多温柔。今天，和小猫一起把遇见的美好收进本子。',art:adventureArt(0)};
 const dialog=document.createElement('dialog');dialog.className='intro-comic adventure-dialog';dialog.setAttribute('aria-label','小猫寄来的插画手账');document.body.append(dialog);
 const finish=()=>{try{localStorage.setItem('miaoye-intro-seen','1');if(story.id)localStorage.setItem('miaoye-story-seen-'+story.id,'1');}catch{}dialog.close();dialog.remove();};
 dialog.innerHTML='<button class="intro-skip">跳过</button><p class="eyebrow">'+esc(story.name)+'的冒险手账 · '+new Date(story.created).toLocaleDateString('zh-CN')+'</p><img class="adventure-illustration" src="'+esc(story.art||adventureArt(story.cat))+'" alt="'+esc(story.title)+' · 完整收藏插画"><h1>'+esc(story.title)+'</h1><p class="comic-caption">'+esc(story.body)+'</p><div class="adventure-buttons"><button class="button secondary save-adventure">保存这张手账</button><button class="button primary comic-next">收好故事，记录今天</button></div><p class="adventure-save-note" role="status"></p>';
 dialog.querySelector('.intro-skip').onclick=finish;dialog.querySelector('.comic-next').onclick=finish;dialog.querySelector('.save-adventure').onclick=async e=>{const button=e.currentTarget;button.disabled=true;button.textContent='正在准备图片…';try{const png=await adventurePng(story);if(window.MIAOYE_ANDROID&&window.MiaoyeExport){window.MiaoyeExport.savePng(png);dialog.querySelector('.adventure-save-note').textContent='选择保存位置，就能收好完整插画与短文。';}else{const link=document.createElement('a');link.href=png;link.download='喵页-'+story.name+'-'+story.title+'.png';link.click();dialog.querySelector('.adventure-illustration').src=png;dialog.classList.add('is-saved');dialog.querySelector('.adventure-save-note').textContent='完整手账已生成；手机也可以长按上方图片保存。';}}catch{dialog.querySelector('.adventure-save-note').textContent='图片还没准备好，请稍后再保存。';}finally{button.disabled=false;button.textContent='保存这张手账';}};
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});dialog.showModal();
}
export function firstIntro(story){if(story){try{if(!localStorage.getItem('miaoye-intro-v9-migrated')){if(localStorage.getItem('miaoye-intro-seen')==='1')localStorage.setItem('miaoye-story-seen-'+story.id,'1');localStorage.setItem('miaoye-intro-v9-migrated','1');}if(localStorage.getItem('miaoye-story-seen-'+story.id)==='1')return;}catch{}return showIntro(story);}try{if(localStorage.getItem('miaoye-intro-seen')==='1')return;}catch{}showIntro();}
