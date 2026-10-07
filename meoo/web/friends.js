import {avatarHtml} from './social-profile.js';
export function initFriends({cloud,openModal,toast,esc,records,prepare,showFeed}){
  let me,selected='all',pending=false,preview=null,posts=[],friendRows=[],scrollTimer;
  const viewed=new Map();
  const accepted=()=>friendRows.filter(f=>f.accepted&&f.user_id!==me.id);
  const latest=id=>posts.filter(p=>p.owner===id).map(p=>p.id).join('|');
  const seenKey=id=>'miaoye-friend-seen:'+me.id+':'+id;
  function seen(id){try{return localStorage.getItem(seenKey(id))||viewed.get(seenKey(id));}catch{return viewed.get(seenKey(id));}}
  function markSeen(id){const value=latest(id);viewed.set(seenKey(id),value);try{localStorage.setItem(seenKey(id),value);}catch{}}
  const hasNew=id=>latest(id).split('|').filter(Boolean).some(post=>!(seen(id)||'').split('|').includes(post));
  const rpc=(name,body={})=>cloud.request('rest/v1/rpc/miaoye_social_'+name,{method:'POST',body:JSON.stringify(body)});
  async function identity(){if(!cloud.getUser()){cloud.panel();throw Error('先登录云账号，再打开好友手账。');}me=await rpc('me');return me;}
  const nameOf=p=>p.note||p.nickname||p.username;
  const person=(p,self=false)=>`<button class="social-person person-button" data-social="${self?'self':'note'}" data-user="${esc(p.user_id||p.owner||p.id)}" aria-label="${self?'编辑我的头像和昵称':'给'+nameOf(p)+'加备注'}">${avatarHtml(p.avatar,esc,nameOf(p))}<span><strong>${esc(self?'我 · '+(p.nickname||p.username):nameOf(p))}</strong><small>${esc(self?p.username:p.note?p.nickname||p.username:'点击头像加备注')}</small></span></button>`;
  function postHtml(p){return `<article class="friend-post feed-paper"><header class="feed-post-header">${person(p,p.owner===me.id)}<time>${esc(p.journal_day)}</time></header><h3>${esc(p.title)}</h3>${p.message?`<p class="feed-message">${esc(p.message)}</p>`:''}<div class="feed-art"><img loading="lazy" src="${esc(p.image)}" alt="${esc(nameOf(p))}分享的手账页面"></div><footer class="feed-post-footer"><button class="feed-like ${p.liked?'is-liked':''}" data-social="like" data-id="${esc(p.id)}" aria-label="${p.liked?'取消点赞':'点赞'}">${p.liked?'♥':'♡'} <span>${p.likes||'喜欢这一页'}</span></button>${p.owner===me.id?`<button class="text-button" data-social="unshare" data-id="${esc(p.id)}">撤回分享</button>`:'<span class="feed-footer-note">把小美好收进今天</span>'}</footer></article>`;}
  function updateSelection(id){
    selected=id;if(id!=='all')markSeen(id);
    const rail=document.querySelector?.('.friend-avatar-rail');
    rail?.querySelectorAll('[data-friend-focus]').forEach(el=>{const active=el.dataset.friendFocus===id;el.classList.toggle('is-current',active);el.setAttribute('aria-current',active?'true':'false');if(active)el.querySelector('.friend-new-dot')?.remove();});
    const list=document.querySelector?.('#friend-feed-list');if(list)list.innerHTML=timelineHtml();
    const heading=document.querySelector?.('#friend-feed-heading');if(heading)heading.textContent=id==='all'?'大家的小日子':nameOf(accepted().find(f=>f.user_id===id)||{})+'的小日子';
  }
  function timelineHtml(){const shown=selected==='all'?posts:posts.filter(p=>p.owner===selected);return shown.length?shown.map(postHtml).join(''):'<div class="feed-empty"><span>♡</span><h3>小日子，慢慢收集</h3><p>这里还没有分享，先贴过来一页今天吧。</p></div>';}
  function railHtml(){return `<div class="friend-avatar-rail" aria-label="左右滑动查看好友"><button class="friend-focus all-friends ${selected==='all'?'is-current':''}" data-friend-focus="all" data-social="all" aria-current="${selected==='all'}" aria-label="全部动态"><span class="all-friends-icon">全部</span><span class="friend-focus-name">全部</span></button>${accepted().map(f=>`<button class="friend-focus ${selected===f.user_id?'is-current':''}" data-friend-focus="${esc(f.user_id)}" data-social="note" data-user="${esc(f.user_id)}" aria-current="${selected===f.user_id}" aria-label="给${esc(nameOf(f))}加备注"><span class="friend-avatar-ring">${avatarHtml(f.avatar,esc,nameOf(f))}${hasNew(f.user_id)?'<span class="friend-new-dot" aria-label="有新动态">+1</span>':''}</span><span class="friend-focus-name">${esc(nameOf(f))}</span></button>`).join('')}</div>`;}
  function bindRail(){
    const rail=document.querySelector?.('.friend-avatar-rail');if(!rail)return;
    const current=[...rail.querySelectorAll('[data-friend-focus]')].find(el=>el.dataset.friendFocus===selected);
    if(current)rail.scrollLeft=current.offsetLeft-rail.querySelector('[data-friend-focus]').offsetLeft;
    rail.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{
      if(!rail.isConnected)return;const bounds=rail.getBoundingClientRect(),anchor=bounds.left+48;
      const items=[...rail.querySelectorAll('[data-friend-focus]')];
      const focused=items.reduce((best,item)=>Math.abs(item.getBoundingClientRect().left+item.offsetWidth/2-anchor)<Math.abs(best.getBoundingClientRect().left+best.offsetWidth/2-anchor)?item:best,items[0]);
      if(focused&&focused.dataset.friendFocus!==selected)updateSelection(focused.dataset.friendFocus);
    },120);},{passive:true});
  }
  async function loadFeed(){
    await identity();[posts,friendRows]=await Promise.all([rpc('feed',{p_today:false}),rpc('friends')]);
    if(selected!=='all'&&!accepted().some(f=>f.user_id===selected))selected='all';
    (showFeed||openModal)(`<div class="friend-feed-design"><header class="friend-feed-header"><div><span class="feed-eyebrow">OUR LITTLE DAYS</span><h2>好友手账</h2><p>隔着屏幕，也一起过小日子。</p></div><button class="feed-add" data-social="friends" aria-label="加好友"><span>＋</span> 加好友</button></header>${railHtml()}<div class="feed-section-heading"><h3 id="friend-feed-heading">${selected==='all'?'大家的小日子':esc(nameOf(accepted().find(f=>f.user_id===selected)))+'的小日子'}</h3><button class="feed-share" data-social="choose">＋ 分享手账</button></div><div id="friend-feed-list">${timelineHtml()}</div><p class="feed-private-note">只分享你主动贴过来的页面 · 最近 30 条动态</p></div>`);bindRail();
  }
  async function feed(reset=true){
    if(reset)selected='all';
    if(!showFeed)return loadFeed();
    if(!cloud.getUser())return showFeed('<h2>好友手账</h2><p class="muted">登录喵页云账号，和好友分享今天的一页，互相点个赞。</p><button class="button primary" data-action="profile">登录 / 注册云账号</button><button class="button secondary" data-social="feed">已登录，刷新好友手账</button>');
    showFeed('<h2>好友手账</h2><p role="status">正在收好好友的分享…</p>');
    try{await loadFeed();}catch(error){showFeed('<h2>好友手账</h2><p role="alert">'+esc(error.message)+'</p><button class="button primary" data-social="feed">重新加载</button>');}
  }
  async function friends(){
    await identity();const rows=await rpc('friends');friendRows=rows;
    openModal(`<h2>我的好友</h2><p>我的喵页用户名：<strong>${esc(me.username)}</strong></p><form id="friend-request" novalidate><label class="field-label">好友的喵页用户名</label><input class="input" name="username" maxlength="32" placeholder="例如 miaoye_123" autocomplete="off"><button class="button primary wide" type="submit">发送好友申请</button><p class="small muted" id="friend-feedback" role="status"></p></form>${rows.map(f=>`<div class="friend-row">${f.accepted?person(f):avatarHtml(f.avatar,esc,f.nickname||f.username)}<strong>${esc(nameOf(f))}</strong><span>${f.accepted?'好友':f.incoming?'想成为你的好友':'等待对方同意'}</span>${!f.accepted&&f.incoming?`<button class="button secondary" data-social="accept" data-id="${esc(f.id)}">同意</button>`:''}<button class="text-button" data-social="remove" data-id="${esc(f.id)}">${f.accepted?'移除好友':f.incoming?'拒绝':'取消申请'}</button></div>`).join('')||'<p class="muted">还没有好友。告诉对方你的用户名，就能互相添加。</p>'}<button class="button secondary wide" data-social="feed">返回好友手账</button>`);
  }
  async function note(id){
    await identity();const friend=friendRows.find(f=>f.user_id===id&&f.accepted)||posts.find(p=>p.owner===id&&id!==me.id);
    if(!friend)throw Error('好友关系已变化，请刷新后重试。');
    openModal(`<h2>给好友加备注</h2>${avatarHtml(friend.avatar,esc,nameOf(friend))}<p>${esc(friend.nickname||friend.username)} · @${esc(friend.username)}</p><form id="friend-note" data-user="${esc(id)}" novalidate><label class="field-label">备注（最多 20 个字）</label><input class="input" name="note" maxlength="20" value="${esc(friend.note||'')}" placeholder="例如 小橘的主人"><p class="small muted">只对你自己可见。留空保存可以清除备注。</p><p id="friend-note-feedback" role="status"></p><button class="button primary wide" type="submit">保存备注</button></form>`);
  }
  async function choose(){
    await identity();const entries=records().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,30);
    openModal('<h2>选一页分享给好友</h2><p class="muted">只会分享预览中的一页图片，不上传整本手账或照片库。</p>'+entries.map(r=>`<button class="button secondary wide" data-social="prepare" data-entry="${esc(r.id)}">${esc(r.date)} · ${esc(r.title||'今天的小美好')}</button>`).join('')+(entries.length?'':'<p>先保存一篇手账，再来分享吧。</p>'));
  }
  async function showPreview(id){
    await identity();preview=await prepare(id);if(!preview)throw Error('手账图片尚未准备好，请稍后再试。');
    openModal(`<h2>把这一页分享给好友？</h2><img class="export-preview" src="${esc(preview.image)}" alt="即将分享的手账页面"><p>${esc(preview.day)} · ${esc(preview.title)}</p><label class="field-label">今天想说的话（可不填）</label><textarea class="input" id="share-message" maxlength="300" rows="3"></textarea><p class="small muted">仅已同意的好友可见，新增好友也能看见未撤回的分享。可以随时撤回；好友已保存的图片无法远程收回。</p><button class="button primary wide" data-social="publish">确认分享这一页</button><button class="text-button" data-social="feed">取消</button>`);
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-social]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(pending)return;pending=true;button.disabled=true;
    try{
      const action=button.dataset.social;
      if(action==='feed')await feed();
      if(action==='all'){updateSelection('all');const rail=document.querySelector?.('.friend-avatar-rail');if(rail)rail.scrollLeft=0;}
      if(action==='friends')await friends();
      if(action==='self')cloud.panel();
      if(action==='note'){updateSelection(button.dataset.user);await note(button.dataset.user);}
      if(action==='choose')await choose();
      if(action==='prepare')await showPreview(button.dataset.entry);
      if(action==='publish'){
        if(!preview)throw Error('请先预览分享页面。');
        await rpc('publish',{p_entry:preview.entry,p_day:preview.day,p_title:preview.title.slice(0,100),p_message:document.querySelector('#share-message').value.trim(),p_image:preview.image});preview=null;selected='all';toast('这一页已分享给好友。');await feed();
      }
      if(action==='like'){const post=posts.find(p=>p.id===button.dataset.id);if(!post)throw Error('请刷新分享列表。');await rpc('like',{p_id:post.id,p_like:!post.liked});await feed(false);}
      if(action==='accept'){await rpc('friend_action',{p_id:button.dataset.id,p_action:'accept'});toast('已成为好友。');await friends();}
      if(action==='remove')openModal(`<h2>结束这条好友关系或申请？</h2><p>移除后，对方无法再查看你的分享，本机手账和云备份仍保留。</p><button class="button primary wide" data-social="confirm-remove" data-id="${esc(button.dataset.id)}">确认移除 / 拒绝</button><button class="text-button" data-social="friends">取消</button>`);
      if(action==='confirm-remove'){await rpc('friend_action',{p_id:button.dataset.id,p_action:'remove'});await friends();}
      if(action==='unshare')openModal(`<h2>撤回这一页分享？</h2><p>好友区将移除这张图片和点赞，本机原手账仍保留。</p><button class="button primary wide" data-social="confirm-unshare" data-id="${esc(button.dataset.id)}">确认撤回</button><button class="text-button" data-social="feed">取消</button>`);
      if(action==='confirm-unshare'){await rpc('unshare',{p_id:button.dataset.id});await feed();}
    }catch(error){toast(error.message);}finally{pending=false;button.disabled=false;}
  },true);
  document.addEventListener('submit',async event=>{
    if(event.target.id==='friend-note'){
      event.preventDefault();event.stopImmediatePropagation();if(pending)return;
      const form=event.target,feedback=form.querySelector('#friend-note-feedback'),button=form.querySelector('button'),value=String(new FormData(form).get('note')||'').trim();
      if(value.length>20){feedback.textContent='备注最多 20 个字。';return;}pending=true;button.disabled=true;
      try{await rpc('note',{p_friend:form.dataset.user,p_note:value});toast('好友备注已保存，仅你可见。');await feed(false);}catch(error){feedback.textContent=error.message;}finally{pending=false;button.disabled=false;}return;
    }
    if(event.target.id!=='friend-request')return;event.preventDefault();event.stopImmediatePropagation();if(pending)return;
    const form=event.target,feedback=form.querySelector('#friend-feedback'),button=form.querySelector('button'),username=String(new FormData(form).get('username')||'').trim();
    if(!/^[A-Za-z0-9_]{3,32}$/.test(username)){feedback.textContent='请填写 3—32 位英文字母、数字或下划线组成的好友用户名。';return;}
    pending=true;button.disabled=true;feedback.textContent='正在发送申请…';
    try{await rpc('request',{p_username:username});toast('申请已发送，等待好友同意。');await friends();}catch(error){feedback.textContent=error.message;}finally{pending=false;button.disabled=false;}
  },true);
  return {feed};
}
