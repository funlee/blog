import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gateway, allNotebooks, collectSnapshot, chinaDate, editionKey, syncReading } from '../scripts/sync-reading.mjs';
import { recentBooks } from '../src/lib/reading.mjs';

const now = new Date('2027-01-01T00:30:00+08:00');
const timestamp = Math.floor(now.getTime() / 1000);
function fixture() {
  const periods = {totalReadTime: 600, readDays: 1, readStat: [{stat:'笔记',counts:'1,405条'}], baseTime: timestamp - 1800, readTimes: {[timestamp - 1800]: 600}};
  const previous = {books: [{id:'a',title:'同一本书',author:'作者',category:'文学',cover:'',versions:[{id:'a',title:'同一本书',progress:10,markedFinished:false,updatedAt:'2026-12-31',url:''}]}]};
  const calls = [];
  const call = async (api, params = {}) => {
    calls.push([api,params]);
    if (api === '/readdata/detail') return periods;
    if (api === '/shelf/sync') return {books:[{bookId:'b',title:'同一本书（修订版）',author:'作者',finishReading:1}, {bookId:'unread',title:'未读书',author:'作者'}, {bookId:'mp',title:'公众号',author:'公众号'}]};
    if (api === '/user/notebooks') return {books:[],hasMore:0,totalBookCount:0};
    return {bookId:params.bookId,book:{progress:params.bookId==='b'?1:0,isStartReading:0,updateTime:timestamp}};
  };
  return {call, previous, rules: [], now, calls};
}
test('跨年使用上海日期、保留旧书、纳入新版本并保持标记独立', async () => {
  const f = fixture();
  const result = await collectSnapshot(f);
  assert.equal(result.updatedAt,'2027-01-01');
  assert.equal(result.summary.year.year,2027);
  assert.equal(result.summary.overall.notes,1405);
  assert.deepEqual(result.monthlySeconds,[600]);
  assert.equal(result.books.length,1);
  assert.equal(result.books[0].versions.length,2);
  assert.equal(result.books[0].versions.find(v=>v.id==='b').progress,1);
  assert.equal(result.books[0].versions.find(v=>v.id==='b').markedFinished,true);
  assert.ok(!f.calls.some(([api,p])=>api==='/book/getprogress' && p.bookId==='mp'));
  assert.equal(chinaDate(new Date('2026-12-31T16:30:00Z')),'2027-01-01');
});
test('版本归一化不混淆上下卷和不同作者', () => {
  assert.equal(editionKey('书名（原书第12版）','[美]甲·乙'),editionKey('书名','甲乙'));
  assert.notEqual(editionKey('JavaScript（上卷）','甲'),editionKey('JavaScript（下卷）','甲'));
  assert.notEqual(editionKey('理想国','甲'),editionKey('理想国','乙'));
});
test('笔记分页使用顶层游标且核对总数', async () => {
  const seen=[];
  const result=await allNotebooks(async (_,params)=>{
    seen.push(params);
    return params.lastSort===undefined ? {totalBookCount:2,hasMore:1,books:[{bookId:'1',sort:10}]} : {totalBookCount:2,hasMore:0,books:[{bookId:'2',sort:9}]};
  });
  assert.equal(result.size,2);
  assert.deepEqual(seen,[{count:100},{count:100,lastSort:10}]);
  await assert.rejects(allNotebooks(async()=>({totalBookCount:2,hasMore:0,books:[]})),/不完整/);
  await assert.rejects(allNotebooks(async()=>({totalBookCount:2,hasMore:1,books:[{bookId:'1',sort:10}]})),/重复/);
});
test('缺少密钥失败；鉴权、升级、业务错误不重试且不泄露回包', async () => {
  assert.throws(()=>gateway(''),/WEREAD_API_KEY/);
  for (const response of [new Response('secret-body',{status:401}),Response.json({upgrade_info:{message:'secret-body'}}),Response.json({errcode:-1,message:'secret-body'})]) {
    let calls=0;
    const call=gateway('test-key',{fetchImpl:async()=>{calls++;return response;}});
    await assert.rejects(call('/test'),error=>!error.message.includes('secret-body'));
    assert.equal(calls,1);
  }
});
test('临时错误限次重试并携带正确接口版本',async()=>{
  let attempts=0;
  const call=gateway('test-key',{wait:async()=>{},fetchImpl:async(url,request)=>{
    assert.equal(url,'https://i.weread.qq.com/api/agent/gateway');
    assert.equal(request.redirect,'error');
    assert.deepEqual(JSON.parse(request.body),{api_name:'/test',skill_version:'1.0.5',count:100});
    return ++attempts<3?new Response('',{status:503}):Response.json({ok:true});
  }});
  assert.deepEqual(await call('/test',{count:100}),{ok:true});assert.equal(attempts,3);
});
test('任何进度失败时原子更新不覆盖旧文件',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'weread-test-'));
  try {
    const file=join(dir,'reading.json');const f=fixture();const original=JSON.stringify(f.previous);
    await writeFile(file,original);
    await assert.rejects(syncReading({output:file,now,log:()=>{},call:async(api,params)=>{
      if(api==='/book/getprogress')throw new Error('进度失败');
      return f.call(api,params);
    }}),/进度失败/);
    assert.equal(await readFile(file,'utf8'),original);
    await syncReading({output:file,now,log:()=>{},call:f.call});
    assert.equal(JSON.parse(await readFile(file,'utf8')).updatedAt,'2027-01-01');
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('最近在读随记录变化且允许为空',()=>{
  const book=(id,date,markedFinished=false)=>({id,versions:[{updatedAt:date,progress:20,markedFinished,url:'https://weread.qq.com/'}]});
  assert.deepEqual(recentBooks([book('old','2026-01-01'),book('new','2027-01-01'),book('done','2027-01-02',true)]).map(b=>b.id),['new','old']);
  assert.deepEqual(recentBooks([]),[]);
});
