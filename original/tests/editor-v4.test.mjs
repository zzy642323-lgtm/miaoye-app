import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import {calendarRange,markerAsset} from '../web/calendar.js';
import {textProblem,textLines} from '../web/text-stickers.js';
test('embedded homepage wins over an empty hosting asset binding',async()=>{const env={ASSETS:{fetch:()=>new Response(null,{status:404})}};const r=await worker.fetch(new Request('https://test.invalid/'),env);assert.equal(r.status,200);assert.match(await r.text(),/editor-v4.css/);const font=await worker.fetch(new Request('https://test.invalid/assets/cute-handwriting.ttf'),env);assert.equal(font.status,200);assert.equal(font.headers.get('Content-Type'),'font/ttf');});
test('calendar week crosses the year boundary and uses the first photo for each date',()=>{assert.deepEqual(calendarRange('2027-01-01','week'),['2026-12-28','2027-01-03']);const photo={id:'a',cutout:false},cutout={id:'b',cutout:true};assert.equal(markerAsset({library:[photo,cutout]}),photo);assert.equal(markerAsset({calendarMarker:'b',library:[photo,cutout],pages:[{items:[{type:'photo',assetId:'a'},{type:'photo',assetId:'b'}]}]}),photo);});
test('text sticker rejects oversized content and too many explicit lines',()=>{assert.equal(textLines('一二三四五六七八九十一二三').length,2);assert.equal(textProblem('开心'), '');assert.ok(textProblem('好'.repeat(61)));assert.ok(textProblem('1\n2\n3\n4\n5\n6\n7'));});
