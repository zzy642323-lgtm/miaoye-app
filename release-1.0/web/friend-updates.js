(()=>{
const CURRENT='miaoye-preview-friends-current',SEEN='miaoye-preview-friends-seen';
function unread(){return (localStorage.getItem(CURRENT)||'initial')!==localStorage.getItem(SEEN)}
function update(){if(typeof feed==='undefined'||typeof entries==='undefined')return;const signature=JSON.stringify(feed.filter(f=>f.name!=='我').map(f=>{const e=entries.find(e=>e.id===f.entry);return [f.entry,e?.updated||e?.created||e?.date||'',e?.title||f.title,e?.note||f.note]}));localStorage.setItem(CURRENT,signature)}
function markRead(){update();localStorage.setItem(SEEN,localStorage.getItem(CURRENT)||'initial');document.querySelectorAll('.nav-badge').forEach(b=>b.remove())}
window.FriendUpdates={unread,update,markRead};
window.addEventListener('storage',e=>{if(e.key===SEEN&&!unread())document.querySelectorAll('.nav-badge').forEach(b=>b.remove())});
})();
