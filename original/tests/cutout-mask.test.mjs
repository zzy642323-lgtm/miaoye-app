import {test} from 'node:test';
import assert from 'node:assert/strict';
import {solidMask} from '../web/cutout-mask.js';
test('solid object keeps opaque interior and clears faint fringe and isolated specks',()=>{
 const v=new Float32Array(400).fill(.1);for(let y=3;y<17;y++)for(let x=3;x<17;x++)v[y*20+x]=.9;
 v[10*20+10]=.1;v[0]=.9;const a=solidMask(v,20,20);
 assert.equal(a[10*20+10],255);assert.equal(a[8*20+8],255);assert.equal(a[0],0);assert.equal(a[1*20+10],0);
});
test('large handle opening remains transparent and separate objects are retained',()=>{
 const v=new Float32Array(400);for(let y=2;y<18;y++)for(let x=2;x<13;x++)v[y*20+x]=.9;
 for(let y=6;y<12;y++)for(let x=5;x<10;x++)v[y*20+x]=0;
 for(let y=4;y<8;y++)for(let x=16;x<19;x++)v[y*20+x]=.9;
 const a=solidMask(v,20,20);assert.equal(a[8*20+7],0);assert.equal(a[5*20+17],255);assert.equal(a[3*20+5],255);
});
