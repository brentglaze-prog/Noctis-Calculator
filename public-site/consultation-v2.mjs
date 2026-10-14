const form=document.querySelector('.inquiry-form');
const interest=form.elements.interest;
const requested=new URL(location.href).searchParams.get('interest');
if([...interest.options].some(o=>o.value===requested))interest.value=requested;
const method=form.elements.contactMethod,phone=form.elements.phone,phoneField=form.querySelector('.phone-field');
method.addEventListener('change',()=>{phoneField.hidden=method.value!=='Phone';phone.required=!phoneField.hidden;});
const status=document.getElementById('inquiry-status'),button=form.querySelector('button');
let requestId='',sending=false,sent=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(sending||sent||!form.reportValidity())return;
 requestId||=crypto.randomUUID();sending=true;button.disabled=true;button.textContent='Saving request…';status.textContent='';status.setAttribute('role','status');
 const data=new FormData(form);
 try{
  const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(data),requestId,consent:data.get('consent')==='on'}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Your request could not be saved. Please try again.');
  sent=true;form.innerHTML='<h2>Request received.</h2><p class="form-status">Your request is saved with the NOCTIS coaching team. We’ll contact you using your preferred method to arrange your consultation. You do not need to send a separate email.</p>';form.setAttribute('role','status');
 }catch(error){status.setAttribute('role','alert');status.textContent=error.name==='TimeoutError'?'We could not confirm your request. Please retry; it will not be duplicated.':error.message;button.disabled=false;button.textContent='Request consultation';}
 finally{sending=false;}
});
