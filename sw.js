if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>i(e,t),c={module:{uri:t},exports:o,require:l};s[t]=Promise.all(n.map((e=>c[e]||l(e)))).then((e=>(r(...e),o)))}}define(["./workbox-7369c0e1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-142daf82.css",revision:null},{url:"assets/index-b1b4c972.js",revision:null},{url:"assets/workbox-window.prod.es5-dc90f814.js",revision:null},{url:"index.html",revision:"336dd753e9ae9b99b56a9f59ffc0f4dc"},{url:"manifest.webmanifest",revision:"2c2ba3d3b10ccaa57c4696f43341dcc2"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
