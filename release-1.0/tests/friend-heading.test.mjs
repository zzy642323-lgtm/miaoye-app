import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('specific friend, own and all views have matching titles without treating a name as HTML',()=>{
 const html=fs.readFileSync(new URL('../web/notebook.html',import.meta.url),'utf8');
 const helper=html.slice(html.indexOf('function friendHeading(){'),html.indexOf('function drawDeck(){'));
 const title={textContent:'',append(dot){this.dot=dot.textContent}},count={},sub={};
 const context={peerFilter:'妈妈',peers:[{},{}],document:{querySelector:s=>s.endsWith('h2')?title:s.endsWith('small')?count:sub,createElement:()=>({})}};
 vm.createContext(context);vm.runInContext(helper,context);
 context.friendHeading();assert.equal(title.textContent,'妈妈的手账');assert.equal(title.dot,'。');assert.equal(sub.textContent,'翻翻妈妈收好的小日子。');
 context.peerFilter='all';context.friendHeading();assert.equal(title.textContent,'好友手账');assert.equal(count.textContent,'2 位朋友');
 context.peerFilter='mine';context.friendHeading();assert.equal(title.textContent,'我的手账');
 context.peerFilter='<img onerror=alert(1)>';context.friendHeading();assert.equal(title.textContent,'<img onerror=alert(1)>的手账');assert.equal(title.innerHTML,undefined);
});
