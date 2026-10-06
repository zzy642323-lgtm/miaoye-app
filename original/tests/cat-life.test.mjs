import test from 'node:test';
import assert from 'node:assert/strict';
import {notebookLimit,updateCatLife,petAffection,storyFor} from '../web/cat-life.js';
import {calendarView} from '../web/calendar.js';
import {storyCatalog} from '../web/story-catalog.js';
test('each personality has ten unique posters; originals and legacy captions remain intact',()=>{
 const titles=new Set(),arts=new Set();for(let cat=0;cat<5;cat++){assert.equal(storyCatalog[cat].length,10);assert.equal(storyCatalog[cat][0].art,`./assets/adventure-${cat}-v8.webp`);for(const story of storyCatalog[cat]){assert.ok(!titles.has(story.title));assert.ok(!arts.has(story.art));titles.add(story.title);arts.add(story.art);}}
 const old=storyFor({cat:0,index:1,created:1},[{name:'奶油'}]);assert.equal(old.title,'喝过水，再出发');assert.equal(old.art,'./assets/adventure-0-v8.webp');
});
test('each cat collects at most ten unique adventures without replacing legacy artwork',()=>{
 const now=1000000000;let life={};for(let n=0;n<15;n++)life=updateCatLife(life,()=>true,now+n*3*86400000,()=>0).life;
 for(let cat=0;cat<5;cat++){assert.equal(life[cat].stories.length,10);assert.deepEqual(life[cat].stories.map(s=>s.index),[0,1,2,3,4,5,6,7,8,9]);}
 const legacy={0:{stories:[{cat:0,index:3,created:now}],nextAt:0}};const migrated=updateCatLife(legacy,i=>i===0,now+86400000,()=>0);assert.equal(migrated.life[0].stories[0].catalogVersion,undefined);assert.equal(migrated.life[0].stories[1].index,1);
});
test('notebook slots unlock only at the fourth and fifth cats',()=>{assert.deepEqual([0,3,8,14,15,24,25,100].map(notebookLimit),[3,3,3,3,4,4,5,5]);});
test('story delivery waits 2–3 days, avoids immediate repeats and does not flood after absence',()=>{const now=1000000000,first=updateCatLife({},i=>i===0,now,()=>0);assert.equal(first.life[0].nextAt,now+2*86400000);assert.equal(first.life[1],undefined);assert.equal(updateCatLife(first.life,i=>i===0,now+86400000,()=>0).changed,false);const later=updateCatLife(first.life,i=>i===0,now+20*86400000,()=>.99);assert.equal(later.life[0].stories.length,2);assert.equal(later.life[0].nextAt,now+23*86400000);assert.notEqual(later.life[0].stories[0].index,later.life[0].stories[1].index);assert.equal(petAffection(later.life,0,'2026-10-04'),true);assert.equal(petAffection(later.life,0,'2026-10-04'),false);assert.equal(later.life[0].affection,8);assert.equal(storyFor(later.life[0].stories[0],[{name:'团团'}]).name,'团团');});
test('weekly calendar renders seven days instead of the month grid across a new year',()=>{const html=calendarView({state:{calendarDate:'2027-01-01',calendarMonth:'2027-01',calendarScope:'week',records:[],books:[]},esc:s=>s,today:'2027-01-01'});assert.equal((html.match(/data-action="calendar-day"/g)||[]).length,7);assert.match(html,/data-date="2026-12-28"/);assert.match(html,/data-date="2027-01-03"/);assert.doesNotMatch(html,/year-grid/);});
