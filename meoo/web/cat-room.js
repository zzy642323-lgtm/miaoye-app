import {companionDays} from './journal-management.js';
import {poseSprite} from './editor-panels.js';

// The device clock drives the little world; no location or weather service is needed.
export function catMoment(date=new Date(),cat=0,tick=0,place=''){
  const hour=date.getHours();
  if(hour<5||hour>=21)return cat===2
    ?{period:'夜晚',pose:0,behavior:'在月光里轻轻巡夜',night:true,place:'house'}
    :{period:'夜晚',pose:3,behavior:'蜷起来睡觉了',night:true,place:'house'};
  if(place==='house'&&hour<17)return {period:hour<11?'早晨':'午后',pose:tick%2?3:4,behavior:tick%2?'在屋里舒舒服服打盹':'在屋里伸了个懒腰',night:false,place:'house'};
  if(place==='garden'&&hour>=17)return {period:'傍晚',pose:tick%2?4:0,behavior:tick%2?'在花园里舒展身体':'在花园里闻闻小花',night:false,place:'garden'};
  if(hour<11)return {period:'早晨',pose:tick%2?2:4,behavior:tick%2?'向新的一天打招呼':'醒来伸个大懒腰',night:false,place:'garden'};
  if(hour<17)return {period:'午后',pose:tick%3===0?3:0,behavior:tick%3===0?'晒着太阳打个盹':'正在好奇地四处看看',night:false,place:'garden'};
  return {period:'傍晚',pose:tick%2?4:2,behavior:tick%2?'舒舒服服伸展一下':'在等你带着故事回来',night:false,place:'house'};
}

export function catRoomHtml({cats,cat,count,unlocked,lastActivity,place,esc,tick=0,life={},story,trait}){
  const moment=catMoment(new Date(),cat,tick,place),world=place||moment.place;
  const ordered=cats.map((c,i)=>({c,i})).sort((a,b)=>Number(unlocked(b.i))-Number(unlocked(a.i))||(a.c.threshold??a.i)-(b.c.threshold??b.i)),next=ordered.find(({i})=>!unlocked(i))?.c,days=lastActivity?Math.floor((Date.now()-lastActivity)/86400000):0;
  const quote=days>=7?'有点想你啦。回来摸摸我，就很好。':days>=3?'这几天有没有遇到小美好？':cats[cat].quote;
  return `<section class="cat-room" aria-label="和小猫待一会儿">
    <div class="room-heading"><div><p class="eyebrow">MY LITTLE COMPANION</p><h1>和小猫，待一会儿。</h1></div><span class="room-clock">${moment.period} · ${world==='house'?'屋里':'花园'}</span></div>
    <div class="habitat ${moment.night?'is-night':''}" data-place="${world}">
      <img class="habitat-art" src="./assets/room-${world==='house'?'house':'garden'}-v6.webp" alt="${world==='house'?'温暖的小房间':'开着小花的户外花园'}">
      <div class="habitat-tint" aria-hidden="true"></div>
      <span class="habitat-caption">${moment.night?'夜深了，轻轻陪着它':'在这里，时间可以慢一点'}</span>
      <button class="habitat-cat pose-${moment.pose}" data-action="room-pet" aria-label="摸摸${esc(cats[cat].name)}">${poseSprite(cat,moment.pose)}<span class="pet-hearts" aria-hidden="true">♡ &nbsp; ♡ &nbsp; ♡</span></button>
      <div class="pet-response" role="status" aria-live="polite">${esc(cats[cat].name)}${moment.behavior}</div>
      <span class="pet-hint">点点小猫，摸摸它</span>
    </div>
    <div class="room-cat-selector" role="group" aria-label="切换陪伴的小猫">${ordered.map(({c,i})=>`<button class="room-cat-thumb ${i===cat?'is-current':''}" data-action="choose-cat" data-cat="${i}" aria-pressed="${i===cat}" aria-label="${esc(c.name)}${unlocked(i)?'陪伴你':'未解锁，需要收集'+c.threshold+'张照片'}" ${unlocked(i)?'':'disabled'}><span class="cat-sprite" data-cat="${i}" role="img" aria-label="${esc(c.name)}"></span><span>${esc(c.name)}${unlocked(i)?'':' 🔒'}</span></button>`).join('')}</div>
    <div class="room-cat-info"><div><h2><button data-action="rename-cat" aria-label="修改${esc(cats[cat].name)}的名字">${esc(cats[cat].name)} ✎</button><span>已陪伴 ${companionDays(life[cat]?.joinedAt||Date.now())} 天</span></h2><p>${trait||cats[cat].trait}</p></div><div class="room-place-picker" role="group" aria-label="切换小猫的场景">${[['garden','花园'],['house','屋里']].map(([key,label])=>`<button data-action="room-place" data-place="${key}" aria-pressed="${key===world}" class="${key===world?'active':''}">${label}</button>`).join('')}</div></div>
    <p class="room-cat-quote">“${esc(quote)}”</p>
    <div class="affection-row"><span>好感度</span><progress max="100" value="${life[cat]?.affection||0}"></progress><strong>${life[cat]?.affection||0} / 100</strong></div><div class="room-progress"><span>已收集 <strong>${count}</strong> 张生活照片</span><span>${next?`再 ${next.threshold-count} 张，${next.name}就来啦`:'五只小猫都来啦'}</span></div>
    ${story?`<article class="cat-adventure"><small>${esc(cats[cat].name)}寄来的冒险手账 · ${new Date(story.created).toLocaleDateString('zh-CN')}</small><button class="story-art-preview" data-action="cat-story" data-id="${story.id}" aria-label="查看${esc(story.title)}完整插画"><img src="${esc(story.art)}" alt="${esc(story.title)}" loading="lazy"></button><h3>${esc(story.title)}</h3><p>${esc(story.body)}</p><button class="text-button" data-action="cat-story" data-id="${story.id}">翻开这页故事</button><small>下一封会在 2—3 天后，打开 APP 时送达。</small></article>`:''}
    <p class="room-footnote">${days>=3?'小猫有点想你，回来就好。':'随一天的时间活动、伸懒腰或睡觉。'}没有喂养任务，也没有断签惩罚。</p>
  </section>`;
}

export function petRoom(root,cat){
  const kitten=root.querySelector('.habitat-cat'),response=root.querySelector('.pet-response');
  if(!kitten||!response)return()=>{};
  const sprite=kitten.querySelector('.cat-pose'),prior=sprite.getAttribute('style');
  sprite.style.backgroundPosition=`100% ${cat*25}%`;
  sprite.setAttribute('aria-label','猫咪抱心心');
  kitten.classList.add('is-petted');
  response.textContent='呼噜呼噜… 小猫蹭了蹭你的手 ♡';
  return()=>{sprite.setAttribute('style',prior);kitten.classList.remove('is-petted');};
}
