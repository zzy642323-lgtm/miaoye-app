// Canvas coordinates are percentages of a 3:4 journal page.
export function arrangePhotos(page,assetById,{continuation=false,selected}={}){
 const photos=page.items.filter(i=>i.type==='photo');if(!photos.length)return;
 const main=photos.find(i=>i.id===selected)||photos[0],ordered=[main,...photos.filter(i=>i!==main)],top=continuation?18:24,bottom=page.caption?85:94,span=bottom-top;
 const ratio=assetById(main.assetId)?.ratio||1;
 let regions;
 if(ordered.length===1)regions=[[5,top,90,span]];
 else if(ratio>1.25)regions=[[5,top,62,span],[69,top,26,span/3-2],[69,top+span/3,26,span/3-2],[69,top+2*span/3,26,span/3-2],[5,top,28,24],[36,bottom-23,28,23]];
 else regions=[[16,top+span*.2,68,span*.65],[5,top,39,span*.33],[57,top,38,span*.32],[66,top+span*.5,29,span*.34],[5,bottom-span*.3,38,span*.3],[44,bottom-span*.23,39,span*.23]];
 // With two photos, give the secondary its own generous corner.
 if(ordered.length===2)regions=[[5,top,75,span*.8],[59,top+span*.56,36,span*.44]];
 if(ordered.length===3)regions=[[5,top+span*.14,72,span*.75],[64,top,31,span*.4],[64,top+span*.58,31,span*.42]];
 if(ordered.length===4&&ratio<=1.25)regions=[regions[0],regions[1],regions[2],regions[4]];
 if(ordered.length===5&&ratio<=1.25)regions=[regions[0],regions[1],regions[2],regions[4],regions[5]];
 ordered.forEach((item,k)=>{const [x,y,w,h]=regions[Math.min(k,regions.length-1)],r=Math.max(.08,Math.min(12,assetById(item.assetId)?.ratio||1)),turn=(k%2?3:-3)*Math.PI/180;
  // Rotated bounds remain within the page; preserve photo proportions.
  const width=Math.min(w/(Math.cos(turn)+r*Math.abs(Math.sin(turn))),h/(.75*(r*Math.cos(turn)+Math.abs(Math.sin(turn))))),height=.75*width*r;
  item.w=Math.max(8,width);item.x=x+(w-width)/2;item.y=y+(h-height)/2;item.rotation=k===0?-2:k%2?3:-3;
 });
 // The main photograph remains visible beneath the surrounding stickers.
 const other=page.items.filter(i=>i.type!=='photo');page.items=[...ordered,...other];
}
