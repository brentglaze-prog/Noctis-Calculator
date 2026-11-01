const sender = {email:'hello@notifications.noctiscoaching.com', name:'Brent | Noctis Coaching'};

const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const firstName = name => String(name || '').trim().split(/\s+/)[0] || 'there';
const bytesToBase64 = bytes => {
 let binary=''; for (const byte of bytes) binary+=String.fromCharCode(byte);
 return btoa(binary);
};
const base64ToBytes = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));

async function encryptionKey(secret){
 if(typeof secret !== 'string' || secret.length < 32) throw new Error('Lead delivery secret is unavailable.');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret));
 return crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['encrypt','decrypt']);
}

async function encryptPayload(payload,secret){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await encryptionKey(secret),new TextEncoder().encode(JSON.stringify(payload)));
 return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptPayload(value,secret){
 const [iv,data]=String(value).split('.');
 if(!iv || !data) throw new Error('Invalid encrypted lead payload.');
 const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(iv)},await encryptionKey(secret),base64ToBytes(data));
 return JSON.parse(new TextDecoder().decode(decrypted));
}

export function buildLeadMessages(inquiry,ownerEmail='brent@noctiscoaching.com'){
 const name=String(inquiry.name || '').trim();
 const email=String(inquiry.email || '').trim().toLowerCase();
 const interest=String(inquiry.interest || 'Coaching').trim();
 const method=String(inquiry.contactMethod || 'Email').trim();
 const phone=String(inquiry.phone || '').trim();
 const greeting=firstName(name);
 const acknowledgmentText=`Hi ${greeting},\n\nThanks for reaching out—your inquiry came through! I’m looking forward to learning more about your goals and seeing how I can help. I’ll be in touch soon to talk through the next steps.\n\nIf you have any questions before then, just reply to this email. Please save any medical details or documents for the secure portal.\n\nTalk soon,\nBrent\nNoctis Coaching\nhttps://noctiscoaching.com`;
 const acknowledgmentHtml=`<p>Hi ${safe(greeting)},</p><p>Thanks for reaching out—your inquiry came through! I’m looking forward to learning more about your goals and seeing how I can help. I’ll be in touch soon to talk through the next steps.</p><p>If you have any questions before then, just reply to this email. Please save any medical details or documents for the secure portal.</p><p>Talk soon,<br>Brent<br>Noctis Coaching<br><a href="https://noctiscoaching.com">noctiscoaching.com</a></p>`;
 const ownerLines=[`Name: ${name}`,`Email: ${email}`,`Interest: ${interest}`,`Preferred contact: ${method}`];
 if(phone)ownerLines.push(`Phone: ${phone}`);
 ownerLines.push('','Open the lead in the staff portal:','https://portal.noctiscoaching.com/app/leads');
 const ownerText=`A new Noctis inquiry was saved.\n\n${ownerLines.join('\n')}`;
 const ownerHtml=`<p>A new Noctis inquiry was saved.</p><p><strong>Name:</strong> ${safe(name)}<br><strong>Email:</strong> ${safe(email)}<br><strong>Interest:</strong> ${safe(interest)}<br><strong>Preferred contact:</strong> ${safe(method)}${phone?`<br><strong>Phone:</strong> ${safe(phone)}`:''}</p><p><a href="https://portal.noctiscoaching.com/app/leads">Open the lead in the staff portal</a></p>`;
 return [
  {kind:'lead_acknowledgment',to:email,subject:'Thanks for reaching out to Noctis!',text:acknowledgmentText,html:acknowledgmentHtml},
  {kind:'owner_notification',to:ownerEmail,subject:`New Noctis inquiry — ${interest}`,text:ownerText,html:ownerHtml},
 ];
}

function secret(env){return env.INQUIRY_RELAY_SECRET || globalThis.process?.env?.INQUIRY_RELAY_SECRET || '';}

export async function queueLeadEmails(inquiry,env){
 if(!env.LEAD_DELIVERY_DB || !env.LEAD_EMAIL) throw new Error('Lead email delivery is not configured.');
 if(!/^[a-f0-9-]{36}$/i.test(String(inquiry.requestId || '')) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(inquiry.email || ''))) throw new Error('Invalid accepted inquiry.');
 const now=Date.now(), messages=buildLeadMessages(inquiry,env.LEAD_OWNER_EMAIL || 'brent@noctiscoaching.com');
 for(const message of messages){
  const encrypted=await encryptPayload(message,secret(env));
  await env.LEAD_DELIVERY_DB.prepare(`INSERT OR IGNORE INTO lead_email_jobs (id,request_id,kind,encrypted_payload,status,attempts,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?, 'pending',0,?,?,?)`)
   .bind(`${inquiry.requestId}:${message.kind}`,inquiry.requestId,message.kind,encrypted,now,now,now).run();
 }
}

const retryDelay = attempts => Math.min(6*60*60*1000, 60*1000 * 2 ** Math.min(attempts,8));

export async function processLeadEmailJobs(env,limit=10){
 if(!env.LEAD_DELIVERY_DB || !env.LEAD_EMAIL) return {processed:0,delivered:0,failed:0};
 const now=Date.now();
 const query=await env.LEAD_DELIVERY_DB.prepare(`SELECT id,encrypted_payload,attempts FROM lead_email_jobs WHERE status IN ('pending','failed') AND next_attempt_at<=? AND (locked_until IS NULL OR locked_until<?) ORDER BY created_at LIMIT ?`).bind(now,now,limit).all();
 let delivered=0,failed=0;
 for(const job of query.results || []){
  const claimed=await env.LEAD_DELIVERY_DB.prepare(`UPDATE lead_email_jobs SET status='sending',locked_until=?,updated_at=? WHERE id=? AND status IN ('pending','failed') AND (locked_until IS NULL OR locked_until<?)`).bind(now+60_000,now,job.id,now).run();
  if(!claimed.meta?.changes)continue;
  try{
   const message=await decryptPayload(job.encrypted_payload,secret(env));
   const result=await env.LEAD_EMAIL.send({...message,from:sender,replyTo:env.LEAD_OWNER_EMAIL || 'brent@noctiscoaching.com'});
   await env.LEAD_DELIVERY_DB.prepare(`UPDATE lead_email_jobs SET status='delivered',attempts=attempts+1,locked_until=NULL,delivered_at=?,provider_message_id=?,last_error=NULL,updated_at=? WHERE id=?`).bind(Date.now(),String(result?.messageId || ''),Date.now(),job.id).run();
   delivered++;
  }catch(error){
   const attempts=Number(job.attempts || 0)+1, next=Date.now()+retryDelay(attempts);
   await env.LEAD_DELIVERY_DB.prepare(`UPDATE lead_email_jobs SET status='failed',attempts=?,next_attempt_at=?,locked_until=NULL,last_error=?,updated_at=? WHERE id=?`).bind(attempts,next,String(error?.message || error).slice(0,200),Date.now(),job.id).run();
   failed++;
  }
 }
 return {processed:delivered+failed,delivered,failed};
}
