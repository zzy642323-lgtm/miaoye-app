(()=>{
const liveFeed=visibleFeed,liveDraw=drawDeck;let cached=null,filter='',signature='',drag=null,refreshing=false;
const stamp=list=>JSON.stringify(list.map(f=>[f.entry,f.time,f.title,f.note,f.photos]));
function allLive(){const selected=peerFilter;try{peerFilter='all';return liveFeed()}finally{peerFilter=selected}}
function capture(){cached=allLive().map(f=>({...f,photos:[...f.photos]}));filter=peerFilter;signature=stamp(cached)}
function hint(){const deck=document.querySelector('#proposal-friends .friend-deck');if(!deck)return;let el=document.querySelector('.friend-refresh-hint');if(!el){el=document.createElement('p');el.className='friend-refresh-hint';el.setAttribute('role','status');deck.before(el)}const changed=cached&&stamp(allLive())!==signature;el.textContent=changed?'有新手账，顶部下拉更新':'顶部下拉，更新好友手账';el.classList.toggle('has-update',!!changed)}
visibleFeed=function(){if(!window.RecordFlow?.ready)return liveFeed();if(!cached)capture();return cached.filter(f=>peerFilter==='all'||peerFilter==='today'&&f.time.startsWith('今天')||peerFilter==='mine'&&f.name==='我'||f.name===peerFilter)};
drawDeck=function(){liveDraw();hint();if(new URLSearchParams(location.search).get('view')==='friends'&&cached&&stamp(liveFeed())===signature)window.FriendUpdates?.markRead()};
async function refresh(){if(refreshing)return;refreshing=true;try{await window.FriendRequests?.refresh(true);capture();deckIndex=0;drawDeck();window.FriendUpdates?.markRead();toast('好友手账已更新')}catch(error){toast(error.message||'更新失败，请再试一次')}finally{refreshing=false}}
window.FriendFeedRefresh={refresh,invalidate(){cached=null},notify:hint};
function top(){const phone=document.querySelector('#proposal-friends.chosen .phone');return phone&&phone.scrollTop<=1&&document.scrollingElement.scrollTop<=1}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#proposal-friends.chosen')||!top()||e.target.closest('button,input'))return;drag={x:e.clientX,y:e.clientY,ready:false}});
document.addEventListener('pointermove',e=>{if(!drag)return;const dy=e.clientY-drag.y;if(Math.abs(e.clientX-drag.x)>35){drag=null;return}if(dy>65){drag.ready=true;const el=document.querySelector('.friend-refresh-hint');if(el)el.textContent='松手更新好友手账'}});
for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>{const ready=drag?.ready;drag=null;if(ready&&event==='pointerup')refresh();else hint()});
window.addEventListener('storage',hint);window.addEventListener('miaoye-friends-update',hint);window.addEventListener('focus',hint);setInterval(()=>{if(!document.hidden)hint()},15000);
document.head.insertAdjacentHTML('beforeend','<style>.friend-refresh-hint{text-align:center;color:#8a8474;font-size:11px;margin:0 0 14px;min-height:18px}.friend-refresh-hint.has-update{color:#665226;background:#f5e8b2;border-radius:20px;padding:7px 12px}</style>');drawDeck();
})();