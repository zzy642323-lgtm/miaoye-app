export function initFriends({cloud,openModal,toast,esc,records,prepare}){
  let me,tab='today',pending=false,preview=null,posts=[];
  const rpc=(name,body={})=>cloud.request('rest/v1/rpc/miaoye_social_'+name,{method:'POST',body:JSON.stringify(body)});
  async function identity(){if(!cloud.getUser()){cloud.panel();throw Error('先登录云账号，再打开好友手账。');}me=await rpc('me');return me;}
  async function feed(){
    await identity();posts=await rpc('feed',{p_today:tab==='today'});
    openModal(`<h2>好友的小日子</h2><p class="muted">${esc(me.username)} · 只有双方同意的好友能看见主动分享的页面。</p><div class="hero-buttons"><button class="button secondary" data-social="today">今天</button><button class="button secondary" data-social="recent">最近分享</button><button class="button secondary" data-social="friends">管理好友</button></div><button class="button primary wide" data-social="choose">分享一页手账</button>${posts.length?posts.map(p=>`<article class="friend-post"><p><strong>${esc(p.username)}</strong> · ${esc(p.journal_day)}</p><h3>${esc(p.title)}</h3><img class="export-preview" loading="lazy" src="${esc(p.image)}" alt="${esc(p.username)}分享的手账页面"><p>${esc(p.message)}</p><button class="button secondary" data-social="like" data-id="${esc(p.id)}">${p.liked?'♥ 已点赞':'♡ 点赞'} · ${p.likes}</button>${p.owner===me.id?`<button class="text-button" data-social="unshare" data-id="${esc(p.id)}">撤回分享</button>`:''}</article>`).join(''):'<p class="muted">'+(tab==='today'?'今天还没有分享。可以先添加好友，再把今天的一页贴过来。':'还没有分享。')+'</p>'}<p class="small muted">每次显示最近 30 条。新增好友也能看到你尚未撤回的分享。</p>`);
  }
  async function friends(){
    await identity();const rows=await rpc('friends');
    openModal(`<h2>我的好友</h2><p>我的喵页用户名：<strong>${esc(me.username)}</strong></p><form id="friend-request" novalidate><label class="field-label">好友的喵页用户名</label><input class="input" name="username" maxlength="32" placeholder="例如 miaoye_123" autocomplete="off"><button class="button primary wide" type="submit">发送好友申请</button><p class="small muted" id="friend-feedback" role="status"></p></form>${rows.map(f=>`<div class="friend-row"><strong>${esc(f.username)}</strong><span>${f.accepted?'好友':f.incoming?'想成为你的好友':'等待对方同意'}</span>${!f.accepted&&f.incoming?`<button class="button secondary" data-social="accept" data-id="${esc(f.id)}">同意</button>`:''}<button class="text-button" data-social="remove" data-id="${esc(f.id)}">${f.accepted?'移除好友':f.incoming?'拒绝':'取消申请'}</button></div>`).join('')||'<p class="muted">还没有好友。告诉对方你的用户名，就能互相添加。</p>'}<button class="button secondary wide" data-social="feed">返回好友手账</button>`);
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
      if(action==='today'||action==='recent'){tab=action;await feed();}
      if(action==='friends')await friends();
      if(action==='choose')await choose();
      if(action==='prepare')await showPreview(button.dataset.entry);
      if(action==='publish'){
        if(!preview)throw Error('请先预览分享页面。');
        await rpc('publish',{p_entry:preview.entry,p_day:preview.day,p_title:preview.title.slice(0,100),p_message:document.querySelector('#share-message').value.trim(),p_image:preview.image});preview=null;tab='recent';toast('这一页已分享给好友。');await feed();
      }
      if(action==='like'){const post=posts.find(p=>p.id===button.dataset.id);if(!post)throw Error('请刷新分享列表。');await rpc('like',{p_id:post.id,p_like:!post.liked});await feed();}
      if(action==='accept'){await rpc('friend_action',{p_id:button.dataset.id,p_action:'accept'});toast('已成为好友。');await friends();}
      if(action==='remove')openModal(`<h2>结束这条好友关系或申请？</h2><p>移除后，对方无法再查看你的分享，本机手账和云备份仍保留。</p><button class="button primary wide" data-social="confirm-remove" data-id="${esc(button.dataset.id)}">确认移除 / 拒绝</button><button class="text-button" data-social="friends">取消</button>`);
      if(action==='confirm-remove'){await rpc('friend_action',{p_id:button.dataset.id,p_action:'remove'});await friends();}
      if(action==='unshare')openModal(`<h2>撤回这一页分享？</h2><p>好友区将移除这张图片和点赞，本机原手账仍保留。</p><button class="button primary wide" data-social="confirm-unshare" data-id="${esc(button.dataset.id)}">确认撤回</button><button class="text-button" data-social="feed">取消</button>`);
      if(action==='confirm-unshare'){await rpc('unshare',{p_id:button.dataset.id});await feed();}
    }catch(error){toast(error.message);}finally{pending=false;button.disabled=false;}
  },true);
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='friend-request')return;event.preventDefault();event.stopImmediatePropagation();if(pending)return;
    const form=event.target,feedback=form.querySelector('#friend-feedback'),button=form.querySelector('button'),username=String(new FormData(form).get('username')||'').trim();
    if(!/^[A-Za-z0-9_]{3,32}$/.test(username)){feedback.textContent='请填写 3—32 位英文字母、数字或下划线组成的好友用户名。';return;}
    pending=true;button.disabled=true;feedback.textContent='正在发送申请…';
    try{await rpc('request',{p_username:username});toast('申请已发送，等待好友同意。');await friends();}catch(error){feedback.textContent=error.message;}finally{pending=false;button.disabled=false;}
  },true);
  return {feed};
}
