// 다마고치 offline support. Bump VERSION when the game files change.
const VERSION="dama-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=="dama-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // the page itself: try the network first so updates arrive, fall back to the saved copy offline
    if(req.mode==="navigate"){
      e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VERSION).then(c=>c.put("./index.html",cp));return r}).catch(()=>caches.match("./index.html")));
      return;
    }
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp));return r})));
  }else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    // fonts: keep a copy so the game looks the same offline
    e.respondWith(caches.open("dama-fonts").then(c=>c.match(req).then(m=>m||fetch(req).then(r=>{c.put(req,r.clone());return r}))));
  }
});
