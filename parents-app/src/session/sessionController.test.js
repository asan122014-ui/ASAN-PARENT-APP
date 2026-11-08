import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionController} from './sessionController.js';
const jwt=exp=>'x.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.y';
function setup(send,initial={refreshToken:'old'},token=jwt(1)) {
 let stored=initial?JSON.stringify(initial):null,access=token,account;const calls=[];
 const vault={get:async()=>stored,set:async value=>{stored=value;calls.push(value);},remove:async()=>{stored=null;}};
 const session=createSessionController({vault,send,readAccess:()=>access,writeAccess:value=>{access=value;},writeAccount:value=>{account=value;},onInvalid:()=>{},randomId:()=> 'rotation-1'});
 return {session,vault,calls,get stored(){return stored;},get access(){return access;},get account(){return account;}};
}
test('overlapping expired requests renew once and persist operation before sending',async()=>{
 let count=0;const state=setup(async(action,body)=>{count++;assert.equal(action,'refresh');assert.equal(JSON.parse(state.stored).rotationId,'rotation-1');assert.equal(body.rotationId,'rotation-1');return {refreshToken:'next',token:jwt(9999999999),data:{name:'Parent'}};});
 await Promise.all([state.session.ensure(),state.session.ensure()]);assert.equal(count,1);assert.equal(JSON.parse(state.stored).refreshToken,'next');assert.equal(state.account.name,'Parent');
 await state.session.ensure();assert.equal(count,1);
});
test('network failure retains access and durable pending operation for later recovery',async()=>{
 let attempts=0;const state=setup(async(action,body)=>{assert.equal(body.rotationId,'rotation-1');if(++attempts===1)throw new Error('offline');return {refreshToken:'new',token:jwt(9999999999)};});
 await assert.rejects(state.session.ensure(),/offline/);assert.ok(state.access);assert.equal(JSON.parse(state.stored).refreshToken,'old');await state.session.ensure();assert.equal(attempts,2);
});
test('revoked credential clears session; network failures never do',async()=>{
 const state=setup(async()=>{throw {response:{status:401,data:{code:'SESSION_REVOKED'}}};});
 await assert.rejects(state.session.ensure());assert.equal(state.access,null);assert.equal(state.stored,null);
});
test('valid legacy JWT migrates without OTP; no anonymous migration',async()=>{
 let count=0;const state=setup(async(action,body,token)=>{count++;assert.equal(action,'migrate');assert.ok(token);return {refreshToken:'new',token:jwt(9999999999)};},null,jwt(9999999999));
 await state.session.ensure();assert.equal(count,1);
 const empty=setup(async()=>{throw Error('must not send');},null,null);assert.equal(await empty.session.ensure(),null);
});
test('late renewal cannot resurrect logout or overwrite a new login',async()=>{
 let complete;const state=setup(()=>new Promise(resolve=>{complete=resolve;}));const refresh=state.session.ensure();await new Promise(resolve=>setImmediate(resolve));
 await state.session.clear();await state.session.adopt({refreshToken:'new-user',token:'new-access',data:{name:'New'}});
 complete({refreshToken:'stale',token:'stale-access',data:{name:'Old'}});await refresh;
 assert.equal(state.access,'new-access');assert.equal(JSON.parse(state.stored).refreshToken,'new-user');assert.equal(state.account.name,'New');
});
test('logout revokes the stored credential and clears it even if offline',async()=>{
 let revoked;const state=setup(async(action,body)=>{revoked={action,body};throw Error('offline');});await state.session.logout();assert.equal(revoked.action,'logout');assert.equal(revoked.body.refreshToken,'old');assert.equal(state.access,null);assert.equal(state.stored,null);
});

test('a delayed vault read cannot replace the credentials of a fresh login',async()=>{
 let finish;const state=setup(async(action,body)=>{assert.equal(body.refreshToken,'fresh');return {refreshToken:'renewed',token:jwt(9999999999)};});
 state.vault.get=()=>new Promise(resolve=>{finish=resolve;});
 const old=state.session.ensure();await new Promise(resolve=>setImmediate(resolve));
 await state.session.adopt({refreshToken:'fresh',token:jwt(9999999999)});
 finish(JSON.stringify({refreshToken:'old'}));await old;await state.session.ensure(true);
 assert.equal(JSON.parse(state.stored).refreshToken,'renewed');
});
