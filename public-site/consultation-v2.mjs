const form=document.querySelector('.inquiry-form');
const interest=form.elements.interest;
const requested=new URL(location.href).searchParams.get('interest');
if([...interest.options].some(o=>o.value===requested))interest.value=requested;
const labRequest=new URL(location.href).searchParams.get('service')==='labs';
const introHeading=document.querySelector('.consultation-layout h1');
const introText=document.querySelector('.consultation-layout .compact-intro>p:not(.eyebrow)');
const defaultHeading=introHeading.textContent,defaultIntro=introText.textContent;
const labGoal='I’d like access to lab testing through Fullscript.';
const status=document.getElementById('inquiry-status'),button=form.querySelector('button');
const collection=form.elements.collectionPreference;
const collectionField=collection.closest('label');
if(labRequest)interest.value='Lab Testing';
function updateLabForm(){
 const labs=interest.value==='Lab Testing';
 collectionField.hidden=!labs;
 collection.disabled=!labs;
 button.textContent=labs?'Request lab discussion':'Request consultation';
 introHeading.textContent=labs?'Discuss lab testing.':defaultHeading;
 introText.textContent=labs?'Get access to labs through Fullscript. We’ll confirm test availability, independent clinical authorization, collection options, and costs before you commit.':defaultIntro;
 form.elements.obstacle.required=!labs;
 form.elements.obstacle.closest('label').hidden=labs;
 if(labs&&!form.elements.goal.value)form.elements.goal.value=labGoal;
 if(!labs&&form.elements.goal.value===labGoal)form.elements.goal.value='';
}
interest.addEventListener('change',updateLabForm);
updateLabForm();
const method=form.elements.contactMethod,phone=form.elements.phone,phoneField=form.querySelector('.phone-field');
method.addEventListener('change',()=>{phoneField.hidden=method.value!=='Phone';phone.required=!phoneField.hidden;});
const discovery=form.elements.discoverySource,discoveryDetail=form.elements.discoveryDetail;
const discoveryField=discoveryDetail.closest('label');
function updateDiscovery(){
 const show=['Referral','Other'].includes(discovery.value);
 discoveryField.hidden=!show;
 discoveryDetail.disabled=!show;
 discoveryField.querySelector('span').textContent=discovery.value==='Referral'?'Who referred you? (optional)':'Where did you hear about us? (optional)';
}
discovery.addEventListener('change',updateDiscovery);
updateDiscovery();
let requestId='',sending=false,sent=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(sending||sent||!form.reportValidity())return;
 requestId||=crypto.randomUUID();sending=true;button.disabled=true;button.textContent='Saving request…';status.textContent='';status.setAttribute('role','status');
 const data=new FormData(form);
 if(data.get('interest')==='Lab Testing'){data.set('interest','Health Coaching');data.set('goal',('Lab testing inquiry | Collection: '+(data.get('collectionPreference')||'Discuss options')+' | '+(data.get('goal')||'')).slice(0,2000));}
 data.delete('collectionPreference');
 try{
  const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(data),requestId,consent:data.get('consent')==='on'}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Your request could not be saved. Please try again.');
  sent=true;form.innerHTML='<h2>Request received.</h2><p class="form-status">Your request is saved with the NOCTIS coaching team. We’ll contact you using your preferred method to arrange your consultation. You do not need to send a separate email.</p>';form.setAttribute('role','status');
 }catch(error){status.setAttribute('role','alert');status.textContent=error.name==='TimeoutError'?'We could not confirm your request. Please retry; it will not be duplicated.':error.message;button.disabled=false;button.textContent=interest.value==='Lab Testing'?'Request lab discussion':'Request consultation';}
 finally{sending=false;}
});

