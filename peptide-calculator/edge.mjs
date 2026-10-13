// Bounded integration with the existing NOCTIS public Worker.
import original from './index.js';
import {files} from './peptide-calculator/files.mjs';
const base = '/resources/peptide-calculator/';
const headers = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'none'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()'
};
export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    let name;
    if (path === '/resources' || path === '/resources/') name = 'resources.html';
    else if (path === base || path === base.slice(0,-1)) name = 'index.html';
    else if (path.startsWith(base)) name = path.slice(base.length);
    if (name && Object.hasOwn(files, name)) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405,headers:{...headers,Allow:'GET, HEAD'}});
      const type = name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : 'text/javascript';
      return new Response(request.method === 'HEAD' ? null : files[name], {headers:{...headers,'Content-Type':`${type}; charset=utf-8`}});
    }
    return original.fetch(request, env, ctx);
  }
};
