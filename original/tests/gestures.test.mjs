import test from 'node:test';
import assert from 'node:assert/strict';
import {bindCanvas} from '../web/gestures.js';
test('photo and text gestures permit crossing all paper edges',()=>{for(const type of ['photo','text']){const item={id:'a',type,x:0,y:100,w:120,rotation:0},listeners={},element={style:{}},canvas={addEventListener:(k,fn)=>listeners[k]=fn,querySelector:()=>element};let saved=0;bindCanvas(canvas,[item],{asset:()=>({ratio:1}),selected:'a',setSelected(){},snapshot(){},save(){saved++;}});for(const key of ['ArrowLeft','ArrowDown','+'])listeners.keydown({key,preventDefault(){}});assert.equal(item.x,-1);assert.equal(item.y,101);assert.equal(item.w,122);assert.equal(saved,3);assert.match(element.style.cssText,/left:-1%/);}});
