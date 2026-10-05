import test from 'node:test';
import assert from 'node:assert/strict';
import {recentJournals} from '../web/notebook-shelf.js';
import {removePlainBackground} from '../web/offline-cutout.js';
test('recent journals span notebooks and rank save time above journal date',()=>{const records=[{id:'old',bookId:'a',date:'2026-10-05',updatedAt:10},{id:'new',bookId:'b',date:'2020-01-01',updatedAt:30},{id:'deleted',bookId:'hidden',updatedAt:100}];assert.deepEqual(recentJournals(records,[{id:'a'},{id:'b'}]).map(r=>r.id),['new','old']);assert.equal(records[0].id,'old');});
test('legacy records preserve their saved list order',()=>{assert.deepEqual(recentJournals([{id:2,bookId:'a'},{id:1,bookId:'a'}],[{id:'a'}]).map(r=>r.id),[2,1]);});
function fixture(){let p=new Uint8ClampedArray(9*9*4).fill(255);for(let y=2;y<=6;y++)for(let x=2;x<=6;x++){let i=(y*9+x)*4;p[i]=p[i+1]=p[i+2]=0;}p[(4*9+4)*4]=p[(4*9+4)*4+1]=p[(4*9+4)*4+2]=255;return p;}
test('offline cutout removes edge background and preserves enclosed matching foreground',()=>{let p=fixture(),r=removePlainBackground(p,9,9);assert.equal(r.removed,true);assert.equal(r.pixels[3],0);assert.equal(r.pixels[(4*9+4)*4+3],255);assert.equal(r.pixels[(2*9+2)*4+3],255);assert.equal(p[3],255);});
test('blank photo is retained instead of erasing everything',()=>{let p=new Uint8ClampedArray(9*9*4).fill(255),r=removePlainBackground(p,9,9);assert.equal(r.removed,false);assert.deepEqual(r.pixels,p);});
