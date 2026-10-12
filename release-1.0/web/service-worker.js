const CACHE='miaoye-web-1.0.15-apple1';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./index.html?view=c','./notebook.html','./manifest.webmanifest','./assets/app-icon-192.png','./assets/app-icon-512.png']))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('miaoye-web-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/cloud/')||url.pathname.includes('/downloads/')||/version.*\.json$/.test(url.pathname))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response;
 }).catch(()=>caches.match(event.request).then(saved=>saved||Response.error())));
});
