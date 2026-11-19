const CACHE='ece-course-tracker-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(response=>{
      if(response.ok){const saved=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',saved));}
      return response;
    }).catch(async()=>await caches.match('./index.html')||Response.error()));
    return;
  }
  if(!/\.(?:png|webmanifest)$/.test(url.pathname))return;
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
