import {illustratedStory} from './adventure-art.js';
export const notebookLimit=n=>n>=25?5:n>=15?4:3;
export const catTraits=['小只纤细 · 温柔慢热','圆滚滚的大橘 · 热情贪吃','高挑长尾 · 安静勇敢','结实短尾 · 活泼好奇','小小毛团 · 害羞黏人'];
// Legacy records keep their original illustration; new records use the unique catalog.
export function updateCatLife(saved={},unlocked,now=Date.now(),rng=Math.random){
 const life=structuredClone(saved);let changed=false;
 for(let cat=0;cat<5;cat++)if(unlocked(cat)){
  const item=life[cat]??={affection:0,stories:[],nextAt:0,joinedAt:now};
  if(!item.joinedAt){item.joinedAt=item.stories[0]?.created||now;changed=true;}
  const used=new Set(item.stories.map(story=>story.catalogVersion===2?story.index:0));
  if(used.size>=10)continue;
  if(!item.nextAt||now>=item.nextAt){
   let index=0;while(used.has(index))index++;
   item.stories.push({id:`${cat}-${now}`,cat,index,catalogVersion:2,created:now});
   item.affection=Math.min(100,(item.affection||0)+3);
   item.nextAt=now+(2+Math.min(1,Math.floor(rng()*2)))*86400000;changed=true;
  }
 }
 return {life,changed};
}
export function petAffection(life,cat,day){const item=life[cat];if(!item||item.petDay===day)return false;item.petDay=day;item.affection=Math.min(100,(item.affection||0)+2);return true;}
export function storyFor(r,cats){if(!r)return null;return illustratedStory(r,cats);}
export function latestStory(life,cats){return storyFor(Object.values(life).flatMap(x=>x.stories||[]).sort((a,b)=>b.created-a.created)[0],cats);}
