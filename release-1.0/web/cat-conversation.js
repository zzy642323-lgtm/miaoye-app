(()=>{
const sessions=new Map(),cursors=new Map();let active='',lastReply='';
function show(next=false){
 const entry=friendCatContext(),cat=RecordArt.adopted().cat;
 const key=JSON.stringify([entry.entry,cat,CatVoice.journalText(entry)]);
 let state=sessions.get(key);
 if(!state){state={replies:CatVoice.friendReplies(entry,cat),index:0};sessions.set(key,state);if(sessions.size>50)sessions.delete(sessions.keys().next().value)}
 if(next||active!==key){
  let index=(cursors.get(cat)||0)%state.replies.length;
  if(state.replies.length>1&&state.replies[index]===lastReply)index=(index+1)%state.replies.length;
  state.index=index;cursors.set(cat,index+1);active=key;lastReply=state.replies[index];
 }
 const bubble=document.querySelector('.cat-bubble span');
 if(bubble){bubble.textContent=state.replies[state.index];bubble.setAttribute('aria-live','polite')}
 const button=document.querySelector('[data-cat-quips]');
 if(button){button.disabled=false;button.setAttribute('aria-busy','false')}
}
const original=renderCat;renderCat=function(){original();if(document.querySelector('.cat-bubble span'))show()};
window.FriendCatChat={next:()=>show(true)};
window.addEventListener('miaoye-account-change',()=>{sessions.clear();cursors.clear();active='';lastReply='';renderCat()});
renderCat();
})();
