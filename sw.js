if(!self.define){let e,n={};const i=(i,r)=>(i=new URL(i+".js",r).href,n[i]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=n,document.head.appendChild(e)}else e=i,importScripts(i),n()})).then((()=>{let e=n[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,s)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(n[o])return;let l={};const c=e=>i(e,o),f={module:{uri:o},exports:l,require:c};n[o]=Promise.all(r.map((e=>f[e]||c(e)))).then((e=>(s(...e),l)))}}define(["./workbox-7369c0e1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"android-chrome-192x192.png",revision:"27c20c6ebe309cccfd9e569c0c288387"},{url:"android-chrome-512x512.png",revision:"5da4074c6fe37f81a1399efef56043e8"},{url:"apple-touch-icon.png",revision:"577a1905c7e597cd814902d809fe9259"},{url:"assets/index-7ad68380.js",revision:null},{url:"assets/index-eb44e7a0.css",revision:null},{url:"assets/inter-cyrillic-400-normal-e9493683.woff2",revision:null},{url:"assets/inter-cyrillic-ext-400-normal-f7666a51.woff2",revision:null},{url:"assets/inter-greek-400-normal-2f2d421a.woff2",revision:null},{url:"assets/inter-greek-ext-400-normal-d3e30cde.woff2",revision:null},{url:"assets/inter-latin-400-normal-0364d368.woff2",revision:null},{url:"assets/inter-latin-ext-400-normal-64a98f58.woff2",revision:null},{url:"assets/jetbrains-mono-cyrillic-400-normal-6ebfa299.woff2",revision:null},{url:"assets/jetbrains-mono-latin-400-normal-78f358e7.woff2",revision:null},{url:"assets/jetbrains-mono-latin-ext-400-normal-ae46b4e3.woff2",revision:null},{url:"assets/workbox-window.prod.es5-dc90f814.js",revision:null},{url:"favicon-16x16.png",revision:"0c7409b30f176528c7f49afad8168c05"},{url:"favicon-32x32.png",revision:"766ff1bc67ecbe0e0cda545db03bc48a"},{url:"favicon.ico",revision:"d7602665c0a9c97b8ed9280f6308c86c"},{url:"index.html",revision:"382875c3f34d1b749a7f9e47eeb7e834"},{url:"mstile-150x150.png",revision:"d8c670230e52c300e436c591bf23a3c4"},{url:"safari-pinned-tab.svg",revision:"6470e24af6517944de2db0efc616ea6f"},{url:"android-chrome-192x192.png",revision:"27c20c6ebe309cccfd9e569c0c288387"},{url:"android-chrome-512x512.png",revision:"5da4074c6fe37f81a1399efef56043e8"},{url:"manifest.webmanifest",revision:"d900b9fbe664432a1ec430f2896eeb4f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
