(()=>{
const liveFeed=visibleFeed,liveDraw=drawDeck;let cached=null,filter='',signature='',drag=null,refreshing=false;
const stamp=list=>JSON.stringify(list.map(f=>[f.entry,f.time,f.title,f.note,f.photos,f.avatar,f.name]));
function allLive(){const selected=peerFilter;try{peerFilter='all';return liveFeed()}finally{peerFilter=selected}}
function capture(){cached=allLive().map(f=>({...f,photos:[...f.photos]}));filter=peerFilter;signature=stamp(cached)}
function hint(){if(refreshing)return;const deck=document.querySelector('#proposal-friends .friend-deck');if(!deck)return;let el=document.querySelector('.friend-refresh-hint');if(!el){el=document.createElement('p');el.className='friend-refresh-hint';el.setAttribute('role','status');deck.before(el)}const changed=cached&&stamp(allLive())!==signature;document.querySelector('#proposal-friends')?.classList.toggle('has-friend-update',!!changed);if(drag?.pulling)return;el.textContent='';el.hidden=true}
visibleFeed=function(){if(!window.RecordFlow?.ready)return liveFeed();if(!cached)capture();return cached.filter(f=>peerFilter==='all'||peerFilter==='today'&&f.time.startsWith('今天')||peerFilter==='mine'&&f.name==='我'||f.name===peerFilter)};
drawDeck=function(){liveDraw();hint();if(new URLSearchParams(location.search).get('view')==='friends'&&cached&&stamp(liveFeed())===signature)window.FriendUpdates?.markRead()};
async function refresh(){if(refreshing)return;refreshing=true;const el=document.querySelector('.friend-refresh-hint');if(el){el.hidden=false;el.textContent='正在更新好友手账…'}try{await window.FriendRequests?.refresh(true,true);await window.FriendSocial?.refresh();capture();deckIndex=0;drawDeck();window.FriendUpdates?.markRead();toast('好友手账已更新')}catch(error){toast(error.message||'更新失败，请再试一次')}finally{refreshing=false;hint()}}
window.FriendFeedRefresh={refresh,invalidate(){cached=null},notify:hint};
function screen(){return document.querySelector('#proposal-friends.chosen .screen')}
function top(){const el=screen();return !!el&&el.scrollTop<=1}
function start(target,x,y){if(refreshing||!target.closest('#proposal-friends.chosen')||target.closest('input,textarea,.nav,dialog')||!top())return;drag={x,y,ready:false,pulling:false}}
function move(x,y,event){if(!drag)return;const dy=y-drag.y,dx=Math.abs(x-drag.x);if(dx>40||(!drag.pulling&&dy< -6)){reset();return}if(dy<=8&&!drag.pulling)return;if(dy>0){drag.pulling=true;drag.ready=dy>=70;if(event.cancelable)event.preventDefault();const el=document.querySelector('.friend-refresh-hint');if(el){el.hidden=false;el.style.setProperty('--pull-space',Math.min(80,dy*.45)+'px');el.textContent=drag.ready?'松手更新好友手账':'继续下拉，更新好友手账'}}}
function reset(){const pulling=drag?.pulling;drag=null;document.querySelector('.friend-refresh-hint')?.style.removeProperty('--pull-space');if(pulling)blockClickUntil=Date.now()+450}
let blockClickUntil=0;
function finish(cancel=false){const ready=drag?.ready;reset();if(ready&&!cancel)refresh();else hint()}
document.addEventListener('touchstart',e=>{if(e.touches.length!==1){reset();return}const p=e.touches[0];start(e.target,p.clientX,p.clientY)},{passive:true});
document.addEventListener('touchmove',e=>{if(e.touches.length!==1){reset();return}const p=e.touches[0];move(p.clientX,p.clientY,e)},{passive:false});
document.addEventListener('touchend',()=>finish(),{passive:true});document.addEventListener('touchcancel',()=>finish(true),{passive:true});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;start(e.target,e.clientX,e.clientY)});
document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')move(e.clientX,e.clientY,e)},{passive:false});
document.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')finish()});document.addEventListener('pointercancel',e=>{if(e.pointerType!=='touch')finish(true)});
window.addEventListener('click',e=>{if(Date.now()<blockClickUntil&&e.target.closest('#proposal-friends.chosen')){e.preventDefault();e.stopImmediatePropagation()}},true);

window.addEventListener('storage',hint);window.addEventListener('miaoye-friends-update',hint);window.addEventListener('focus',hint);setInterval(()=>{if(!document.hidden)hint()},15000);
document.head.insertAdjacentHTML('beforeend','<style>.friend-refresh-hint{text-align:center;color:#8a8474;font-size:11px;margin:0 0 14px;padding-top:var(--pull-space,0px);transition:padding-top .1s}.friend-refresh-hint[hidden]{display:none!important}#proposal-friends .screen{overscroll-behavior-y:contain}#proposal-friends.has-friend-update [data-friend-list]{position:relative}#proposal-friends.has-friend-update [data-friend-list]:after{content:"";position:absolute;right:2px;top:1px;width:7px;height:7px;border-radius:50%;background:#edcd56;box-shadow:0 0 0 2px #f8f5ee}</style>');drawDeck();
})();

