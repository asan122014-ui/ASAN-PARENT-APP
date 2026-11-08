export function createSessionController({ vault, send, readAccess, writeAccess, writeAccount, onInvalid, now = Date.now, randomId = () => crypto.randomUUID() }) {
  let credential, loaded=false, pending, generation=0, writes=Promise.resolve();
  const persist = operation => { const task=writes.then(operation);writes=task.catch(()=>{});return task; };
  const load=async()=>{if(!loaded){const expected=generation,saved=await vault.get();if(expected===generation&&!loaded){credential=saved?JSON.parse(saved):null;loaded=true;}}};
  const expiry=token=>{try{let value=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');value+='='.repeat((4-value.length%4)%4);return JSON.parse(atob(value)).exp*1000;}catch{return 0;}};
  const save=async(result,expected)=>{
    if(expected!==generation||!result?.refreshToken)return;
    const next={refreshToken:result.refreshToken};
    await persist(async()=>{if(expected===generation)await vault.set(JSON.stringify(next));});
    if(expected!==generation)return;
    credential=next;loaded=true;writeAccess(result.accessToken||result.token);if(result.data)writeAccount(result.data);
  };
  const adopt=async result=>{const expected=++generation;await save(result,expected);};
  const clear=async()=>{generation++;credential=null;loaded=true;writeAccess(null);await persist(()=>vault.remove());};
  const ensure=(force=false)=>{
    if(pending)return pending;
    const expected=generation;
    const task=(async()=>{
      await load();if(expected!==generation)return readAccess();
      const token=readAccess();if(!token&&!credential)return null;
      if(credential&&token&&!force&&expiry(token)>now()+60000)return token;
      try{
        let body={};
        if(credential){
          credential={...credential,rotationId:credential.rotationId||randomId()};
          const saved=JSON.stringify(credential);await persist(async()=>{if(expected===generation)await vault.set(saved);});
          if(expected!==generation)return readAccess();body=credential;
        }
        const result=await send(credential?'refresh':'migrate',body,token);
        await save(result,expected);return readAccess();
      }catch(error){
        const status=error.response?.status,code=error.response?.data?.code;
        if(expected===generation&&([401,403].includes(status)||code==='SESSION_EXISTS')){await clear();onInvalid(error);}
        throw error;
      }
    })();
    pending=task;task.finally(()=>{if(pending===task)pending=null;}).catch(()=>{});return task;
  };
  const logout=async()=>{try{await load();}catch{}const saved=credential,access=readAccess();await clear();if(saved||access){try{await send('logout',{refreshToken:saved?.refreshToken},access);}catch{}}};
  return {ensure,adopt,logout,clear};
}
