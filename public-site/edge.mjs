import original from './noctis-peptide-edge.mjs';
import {files} from './public-site/files.mjs';
const pages={'/':'home.html','/coaching':'coaching.html','/method':'method.html','/resources':'resources.html','/contact':'contact.html','/learning-lab/reconstitution':'lab-compact.html'};
const common={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname.length>1?url.pathname.replace(/\/$/,''):url.pathname;
 if(['GET','HEAD'].includes(request.method)){
  if(['/favicon.svg','/favicon.ico','/noctis-favicon-v2.svg'].includes(path))return new Response(request.method==='HEAD'?null:files['noctis-favicon-v2.svg'],{headers:{...common,'Content-Type':'image/svg+xml'}});
  if(path==='/noctis-touch-v2.png'||path==='/icon.png'||path==='/apple-touch-icon.png'){
   const bytes=Uint8Array.from(atob(files['noctis-touch-v2.png']),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{...common,'Content-Type':'image/png'}});
  }
  const name=path==='/resources/peptide-calculator/client.mjs'?'calculator-client-v3.mjs':pages[path]??path.slice(1);
  if(Object.hasOwn(files,name)&&!name.endsWith('.png'))return new Response(request.method==='HEAD'?null:files[name],{headers:{...common,'Content-Type':name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'}});
 }
 let response=await original.fetch(request,env,ctx);
 if(path.startsWith('/resources/peptide-calculator')&&response.headers.get('Content-Type')?.includes('text/html')){response=new HTMLRewriter().on('body',{element(e){e.setAttribute('class','calculator-page');}}).on('head',{element(e){e.append('<link rel="stylesheet" href="/tools-compact-v3.css">',{html:true});}}).transform(response);}
 if(request.method==='GET'&&response.headers.get('Content-Type')?.includes('text/html')){
  return new HTMLRewriter().on('link[rel="icon"]',{element(e){e.setAttribute('href','/noctis-favicon-v2.svg');e.setAttribute('type','image/svg+xml');}}).on('link[rel="apple-touch-icon"]',{element(e){e.setAttribute('href','/noctis-touch-v2.png');}}).on('head',{element(e){e.append('<link rel="stylesheet" href="/site-compact-v2.css">',{html:true});}}).on('.site-header',{element(e){e.append('<a class="consult-nav" href="/contact">Request consultation ↗</a>',{html:true});}}).transform(response);
 }
 return response;
}};
