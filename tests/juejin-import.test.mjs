import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const post = id => readFileSync(new URL(`../src/content/posts/juejin-${id}.md`, import.meta.url), 'utf8');
const blocks = text => [...text.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)].map(m => m[1]);
test('修正后的顺序表支持空表、末尾插入和非法下标', () => {
  const code = blocks(post('6844903840899137549'));
  const ctx = vm.createContext({ list: [], alert() {} });
  vm.runInContext(code.slice(0, 3).join('\n'), ctx);
  vm.runInContext('insertItem("a",0); insertItem("c",1); insertItem("b",1)', ctx);
  assert.deepEqual([...ctx.list], ['a','b','c']);
  assert.equal(vm.runInContext('getItem(1)',ctx),'b');
  vm.runInContext('insertItem("x",-1); insertItem("x",0.5); delItem(3); delItem(1)',ctx);
  assert.deepEqual([...ctx.list], ['a','c']);
});
test('修正后的链表支持首尾操作并拒绝非法位置', () => {
  const code = blocks(post('6844903840899137549'));
  const list = { data: 0, next: null };
  const ctx = vm.createContext({ list, alert() {}, LinkNode: function(data,next){this.data=data;this.next=next;} });
  vm.runInContext(code.slice(3).join('\n'), ctx);
  vm.runInContext('insertItem(list,1,"a"); insertItem(list,2,"c"); insertItem(list,2,"b")',ctx);
  assert.equal(list.data,3);
  assert.equal(vm.runInContext('getItem(list,2).data',ctx),'b');
  vm.runInContext('insertItem(list,0,"x"); insertItem(list,5,"x"); delItem(list,0); delItem(list,2)',ctx);
  assert.equal(list.data,2);
  assert.equal(list.next.next.data,'c');
  vm.runInContext('delItem(list,2); delItem(list,1)',ctx);
  assert.equal(list.data,0);
  assert.equal(list.next,null);
});
test('节流连续触发和尾调用保持间隔，保留 this 与最后参数', () => {
  let now=0,id=0;const timers=new Map(),calls=[];
  const ctx=vm.createContext({ performance:{now:()=>now},setTimeout:(fn,delay)=>{timers.set(++id,{fn,at:now+delay});return id;},clearTimeout:i=>timers.delete(i),record:function(value){calls.push([now,this.name,value]);} });
  const code=blocks(post('6844903837975724039')).find(block => /^function throttle\(/m.test(block));
  assert.ok(code, '文章应包含 throttle 函数的完整代码块');
  vm.runInContext(code+'\nvar wrapped=throttle(record,1000);',ctx);
  function call(t,value){now=t;ctx.value=value;vm.runInContext('wrapped.call({name:"context"},value)',ctx);}
  function tick(t){now=t;for(const [i,timer] of timers){if(timer.at<=t){timers.delete(i);timer.fn();}}}
  call(0,'a');call(100,'b');call(500,'c');tick(1000);
  call(1100,'d');tick(2000);call(3000,'e');
  assert.deepEqual(calls,[[0,'context','a'],[1000,'context','c'],[2000,'context','d'],[3000,'context','e']]);
  assert.equal(timers.size,0);
});
