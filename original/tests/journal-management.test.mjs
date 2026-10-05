import test from 'node:test';
import assert from 'node:assert/strict';
import {catOrder,catUnlocked,companionDays,firstPhoto,orderedBooks,deletePage} from '../web/journal-management.js';
test('every starter choice unlocks exactly one cat initially and four later',()=>{for(let starter=0;starter<5;starter++){assert.deepEqual([0,1,2,3,4].filter(i=>catUnlocked(i,0,starter)),[starter]);for(const [n,count] of [0,3,8,15,25].entries())assert.equal([0,1,2,3,4].filter(i=>catUnlocked(i,count,starter)).length,n+1);assert.equal(catOrder(starter)[0],starter);}});
test('companionship counts the first day and handles clock rollback',()=>{assert.equal(companionDays(1000,1000),1);assert.equal(companionDays(1000,1000+86400000*3),4);assert.equal(companionDays(1000,0),1);});
test('first displayed photo wins over library order and old marker selection',()=>{const a={id:'a'},b={id:'b'};assert.equal(firstPhoto({calendarMarker:'a',library:[a,b],pages:[{items:[{type:'text'},{type:'photo',assetId:'b'},{type:'photo',assetId:'a'}]}]}),b);});
test('selecting a notebook preserves shelf order',()=>{const books=[{id:'a'},{id:'b'},{id:'c'}];assert.deepEqual(orderedBooks(books,'c').map(x=>x.id),['a','b','c']);assert.equal(books[0].id,'a');});
test('page removal preserves at least one page and permits snapshot restore',()=>{const doc={pages:[{id:'a'},{id:'b'}]},before=structuredClone(doc);assert.equal(deletePage(doc,1),true);assert.equal(doc.pages[0].id,'a');assert.equal(deletePage(doc,0),false);assert.equal(before.pages.length,2);});
