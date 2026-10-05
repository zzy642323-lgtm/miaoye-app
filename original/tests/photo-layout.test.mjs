import test from 'node:test';
import assert from 'node:assert/strict';
import {arrangePhotos} from '../web/photo-layout.js';
import {borderType} from '../web/images.js';
test('legacy border settings map to the four selectable styles',()=>{assert.equal(borderType(true),'line');assert.equal(borderType(false),'none');for(const k of ['dots','line','torn','none'])assert.equal(borderType(k),k);});
test('collage makes the selected photo dominant and keeps proportional rotated bounds on the paper',()=>{
 for(const r of [.65,1,1.5])for(const n of [1,2,3,4,5,6]){
  const page={caption:'',items:Array.from({length:n},(_,i)=>({id:String(i),assetId:String(i),type:'photo'}))};arrangePhotos(page,()=>({ratio:r}),{selected:String(n-1)});
  assert.equal(page.items[0].id,String(n-1));assert.ok(page.items.every(i=>Number.isFinite(i.w)&&i.w>=8));
  if(n>1)assert.ok(page.items[0].w>Math.max(...page.items.slice(1).map(i=>i.w)),`main photo not dominant: ${r}/${n}`);
  for(const i of page.items){const h=.75*i.w*r,theta=i.rotation*Math.PI/180,bw=i.w*Math.cos(theta)+i.w*r*Math.abs(Math.sin(theta)),bh=.75*i.w*(r*Math.cos(theta)+Math.abs(Math.sin(theta)));assert.ok(i.x+i.w/2-bw/2>=0);assert.ok(i.x+i.w/2+bw/2<=100);assert.ok(i.y+h/2-bh/2>=17);assert.ok(i.y+h/2+bh/2<=96);}
 }
});
