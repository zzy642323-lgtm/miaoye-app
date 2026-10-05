export function recentJournals(records,books){const ids=new Set(books.map(b=>b.id));return records.map((r,n)=>({r,n})).filter(x=>ids.has(x.r.bookId)).sort((a,b)=>(b.r.updatedAt||b.r.updated||0)-(a.r.updatedAt||a.r.updated||0)||a.n-b.n).map(x=>x.r);}
export function bindNotebookShelf(shelf,onSelect){
 if(!shelf)return;const originals=[...shelf.children];if(!originals.length)return;
 const copy=()=>originals.map(el=>el.cloneNode(true));shelf.prepend(...copy());shelf.append(...copy());
 let timer,drag,ignoreUntil=0,adjusting=false;
 const middle=originals[0],center=el=>{const r=el.getBoundingClientRect(),s=shelf.getBoundingClientRect();return shelf.scrollLeft+r.left+r.width/2-s.left-shelf.clientWidth/2;};
 const span=()=>originals[0].offsetLeft-shelf.children[0].offsetLeft;
 const jump=left=>{adjusting=true;shelf.scrollLeft=left;requestAnimationFrame(()=>{adjusting=false;});};
 const initial=originals.find(el=>el.classList.contains('active'))||middle;
 jump(center(initial));
 const settle=()=>{if(!shelf.isConnected||drag)return;const cards=[...shelf.children],rect=shelf.getBoundingClientRect(),cx=rect.left+shelf.clientWidth/2;
  const nearest=cards.reduce((a,b)=>Math.abs(a.getBoundingClientRect().left+a.offsetWidth/2-cx)<=Math.abs(b.getBoundingClientRect().left+b.offsetWidth/2-cx)?a:b);
  const n=cards.indexOf(nearest),count=originals.length;
  if(n<count)jump(shelf.scrollLeft+span());else if(n>=count*2)jump(shelf.scrollLeft-span());
  if(nearest.dataset.book)onSelect(nearest.dataset.book);
 };
 shelf.addEventListener('scroll',()=>{if(adjusting)return;clearTimeout(timer);timer=setTimeout(settle,160);},{passive:true});
 shelf.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)drag={x:e.clientX,left:shelf.scrollLeft,moved:false};});
 shelf.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8){drag.moved=true;shelf.style.scrollSnapType='none';shelf.setPointerCapture(e.pointerId);shelf.scrollLeft=drag.left-dx;}});
 const end=()=>{if(drag?.moved){ignoreUntil=Date.now()+350;shelf.style.scrollSnapType='';}drag=null;clearTimeout(timer);timer=setTimeout(settle,160);};
 shelf.addEventListener('pointerup',end);shelf.addEventListener('pointercancel',end);shelf.addEventListener('lostpointercapture',end);
 shelf.addEventListener('click',e=>{if(Date.now()<ignoreUntil){e.preventDefault();e.stopPropagation();}},true);
 const resize=new ResizeObserver(()=>{if(!shelf.isConnected){resize.disconnect();return;}if(!drag)jump(center(originals.find(el=>el.classList.contains('active'))||middle));});resize.observe(shelf);
 return ()=>{clearTimeout(timer);resize.disconnect();};
}
