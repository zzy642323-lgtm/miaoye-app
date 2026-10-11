(()=>{
const sessions=new Map();
function show(next=false){
 const entry=friendCatContext(),cat=RecordArt.adopted().cat;
 const key=JSON.stringify([entry.entry,cat,CatVoice.journalText(entry)]);
 let state=sessions.get(key);
 if(!state){state={replies:CatVoice.friendReplies(entry,cat),index:0};sessions.set(key,state);if(sessions.size>50)sessions.delete(sessions.keys().next().value)}
 if(next)state.index=(state.index+1)%state.replies.length;
 const bubble=document.querySelector('.cat-bubble span');
 if(bubble){bubble.textContent=state.replies[state.index];bubble.setAttribute('aria-live','polite')}
 const button=document.querySelector('[data-cat-quips]');
 if(button){button.disabled=false;button.setAttribute('aria-busy','false')}
}
const original=renderCat;renderCat=function(){original();if(document.querySelector('.cat-bubble span'))show()};
window.FriendCatChat={next:()=>show(true)};
window.addEventListener('miaoye-account-change',()=>{sessions.clear();renderCat()});
renderCat();
})();