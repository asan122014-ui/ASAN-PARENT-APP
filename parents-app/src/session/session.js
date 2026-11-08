import axios from 'axios';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { createSessionController } from './sessionController';
const vault = registerPlugin('SessionVault');
const native = Capacitor.getPlatform() === 'android';
const storage = {
  get: async () => native ? (await vault.get()).value : localStorage.getItem('asanRefreshToken'),
  set: async value => { if (native) await vault.set({value}); else localStorage.setItem('asanRefreshToken',value); },
  remove: async () => { if (native) await vault.remove(); else localStorage.removeItem('asanRefreshToken'); },
};
const base = (import.meta.env.VITE_API_BASE_URL || 'https://asan-driverapp.onrender.com/api').replace(/\/+$/, '');
const transport = axios.create({baseURL:base,timeout:30000});
export const session = createSessionController({
 vault:storage,
 send:async(action,body,token)=>(await transport.post('/parent-auth/session/'+action,body,{headers:token?{Authorization:'Bearer '+token}:{}})).data,
 readAccess:()=>localStorage.getItem('accessToken'),
 writeAccess:token=>{if(token)localStorage.setItem('accessToken',token);else localStorage.removeItem('accessToken');window.dispatchEvent(new Event('asan:session-updated'));},
 writeAccount:account=>localStorage.setItem('parent',JSON.stringify(account)),
 onInvalid:()=>{localStorage.removeItem('parent');window.dispatchEvent(new CustomEvent('asan:unauthorized'));},
});
export async function initializeSession() {
 try { await session.ensure(); } catch { /* An offline launch keeps the saved session. */ }
 const resume=()=>{if(document.visibilityState!=='hidden')session.ensure().catch(()=>{});};
 window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);
 window.setInterval(resume,60000);
}
const publicAuth = url => /\/(?:parent|driver)-auth\//.test(url||'') && !/\/(?:me|logout)(?:[/?]|$)/.test(url||'');
export function attachSession(client) {
 client.interceptors.request.use(async config=>{
   if(!publicAuth(config.url)){ const token=await session.ensure();if(token){config.headers=config.headers||{};config.headers.Authorization='Bearer '+token;} }
   return config;
 });
 client.interceptors.response.use(async response=>{if(response.data?.refreshToken)await session.adopt(response.data);return response;},async error=>{
   const config=error.config;
   if(error.response?.status===401 && config && !config._sessionRetried && !publicAuth(config.url)){
     config._sessionRetried=true;
     const token=await session.ensure(true);
     if(token){config.headers=config.headers||{};config.headers.Authorization='Bearer '+token;return client(config);}
   }
   return Promise.reject(error);
 });
}

export function bindSessionSocket(socket) {
 const update=()=>{
   const token=localStorage.getItem('accessToken');
   socket.auth={...(socket.auth||{}),token};
   socket.disconnect();if(token)socket.connect();
 };
 window.addEventListener('asan:session-updated',update);
 return ()=>window.removeEventListener('asan:session-updated',update);
}
