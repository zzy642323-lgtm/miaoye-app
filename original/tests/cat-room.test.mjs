import test from 'node:test';
import assert from 'node:assert/strict';
import {catMoment,catRoomHtml} from '../web/cat-room.js';
const at=hour=>new Date(2026,9,4,hour,0);
test('device time changes behavior at day boundaries and the night cat stays awake',()=>{
  assert.equal(catMoment(at(4)).pose,3);
  assert.equal(catMoment(at(5)).pose,4);
  assert.equal(catMoment(at(11),0,0).pose,3);
  assert.equal(catMoment(at(11),0,1).pose,0);
  assert.equal(catMoment(at(17)).place,'house');
  assert.equal(catMoment(at(21)).night,true);
  assert.equal(catMoment(at(23),2).pose,0);
  assert.equal(catMoment(at(14),0,1,'house').pose,3);
  assert.equal(catMoment(at(14),0,1,'garden').pose,0);
});
test('locked cat is disabled and missing activity gives a gentle return message',()=>{
  const cats=[{name:'奶油',threshold:0,quote:'你好',trait:'温柔'},{name:'橘子',threshold:3}];
  const html=catRoomHtml({cats,cat:0,count:0,unlocked:i=>i===0,lastActivity:Date.now()-8*86400000,place:'house',esc:s=>s});
  assert.match(html,/data-cat="1"[^>]+disabled/);
  assert.match(html,/有点想你啦/);
  assert.match(html,/data-place="house"/);
});
test('cat selector prioritizes unlocked cats in their unlock sequence',()=>{const cats=[{name:'奶油',threshold:3,quote:''},{name:'橘子',threshold:8,quote:''},{name:'墨墨',threshold:15,quote:''},{name:'栗栗',threshold:0,quote:''},{name:'糯米',threshold:25,quote:''}];const html=catRoomHtml({cats,cat:3,count:3,unlocked:i=>i===3||i===0,lastActivity:0,place:'house',esc:s=>s});const group=html.split('aria-label="切换陪伴的小猫"')[1].split('</div>')[0];assert.deepEqual([...group.matchAll(/<button[^>]*data-cat="(\d)"/g)].map(m=>Number(m[1])),[3,0,1,2,4]);});
