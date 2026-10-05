export function catOrder(starter=0){return [starter,...[0,1,2,3,4].filter(i=>i!==starter)];}
export function catUnlocked(cat,count,starter=0){return Number.isInteger(cat)&&catOrder(starter).indexOf(cat)>=0&&count>=[0,3,8,15,25][catOrder(starter).indexOf(cat)];}
export function companionDays(joined,now=Date.now()){return Math.max(1,Math.floor((now-joined)/86400000)+1);}
export function firstPhoto(doc){const item=doc.pages?.flatMap(p=>p.items||[]).find(i=>i.type==='photo');return doc.library?.find(a=>a.id===item?.assetId)||doc.library?.[0];}
export function orderedBooks(books,active){return [...books];}
export function deletePage(doc,index){if(doc.pages.length<=1)return false;doc.pages.splice(index,1);return true;}
