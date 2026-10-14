import {calculate, format} from './math.mjs';
const $ = id => document.getElementById(id);
const form = $('peptide-form');
const syringes = {
 u30:{capacityMl:.3,scale:'u100',ticks:[.5,1],label:'30 units / 0.3 mL U-100'},
 u50:{capacityMl:.5,scale:'u100',ticks:[.5,1,2],label:'50 units / 0.5 mL U-100'},
 u100:{capacityMl:1,scale:'u100',ticks:[1,2],label:'100 units / 1 mL U-100'},
 ml1:{capacityMl:1,scale:'ml',ticks:[.01,.02],label:'1 mL, mL markings'},
 ml3:{capacityMl:3,scale:'ml',ticks:[.1,.2],label:'3 mL, mL markings'}
};
let step=1;
const selected = name => form.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
const number = id => Number($(id).value);
const mode = () => selected('mode');
const config = () => syringes[selected('syringe')];
const svgNS='http://www.w3.org/2000/svg';
function svgNode(tag,attrs={},text){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function syringeSVG(capacity,increment,marking){
 const svg=svgNode('svg',{viewBox:'0 0 720 155',role:'img','aria-label':marking===undefined?`Illustration of a ${capacity} unit U-100 syringe`:`Syringe scale from zero to ${capacity}, highlighted at ${format(marking)}`});
 const start=65,end=655,width=end-start;
 svg.append(svgNode('rect',{x:start,y:58,width,height:47,rx:5,fill:'#141018',stroke:'#ad96af','stroke-width':2}));
 svg.append(svgNode('path',{d:'M 65 75 H 35 V 88 H 65 M 35 81 H 8 M 655 58 V 105 M 655 82 H 700 M 700 60 V 103',fill:'none',stroke:'#ad96af','stroke-width':3}));
 const major=capacity===30?5:capacity===50?10:capacity===100?10:capacity===1?.2:increment===.2?.6:.5;
 if(marking!==undefined)svg.append(svgNode('rect',{x:start,y:59,width:Math.max(0,width*marking/capacity),height:45,fill:'#8f6d89',opacity:.4}));
 // Minor physical markings and major reference labels are separate.
 const count=Math.floor(capacity/increment+1e-9);
 for(let i=0;i<=count;i++){const v=i*increment,x=start+width*v/capacity;svg.append(svgNode('line',{x1:x,x2:x,y1:58,y2:70,stroke:'#cdb8d0','stroke-width':1}));}
 for(let i=0;i<=Math.round(capacity/major);i++){const v=i*major,x=start+width*v/capacity;svg.append(svgNode('line',{x1:x,x2:x,y1:58,y2:80,stroke:'#e4d4e4','stroke-width':2}));svg.append(svgNode('text',{x,y:128,fill:'#e4d4e4','font-size':18,'text-anchor':'middle'},format(v)));}
 if(marking!==undefined){const x=start+width*marking/capacity;svg.append(svgNode('line',{x1:x,x2:x,y1:42,y2:105,stroke:'#ffe0f3','stroke-width':4}));svg.append(svgNode('path',{d:`M ${x-9} 30 L ${x+9} 30 L ${x} 44 Z`,fill:'#ffe0f3'}));svg.append(svgNode('text',{x:Math.max(90,Math.min(620,x)),y:20,fill:'#ffe0f3','font-size':20,'font-weight':600,'text-anchor':'middle'},format(marking)));}
 return svg;
}
for(const [key,size,ml] of [['u30',30,.3],['u50',50,.5],['u100',100,1]]){
 const label=document.createElement('label');label.className='choice-card syringe-card';
 const input=document.createElement('input');input.type='radio';input.name='syringe';input.value=key;input.required=true;
 const span=document.createElement('span');const strong=document.createElement('strong');strong.textContent=`${size} units`;const small=document.createElement('small');small.textContent=`${ml} mL · U-100`;span.append(strong,small);
 label.append(input,span,syringeSVG(size,size/10));$('syringe-choices').append(label);
}
function invalidate(){ $('result').hidden=true;$('result').replaceChildren();$('review').hidden=true;$('confirm').checked=false;$('calculate-button').disabled=true;$('step-error').hidden=true; }
function showStep(n,focus=true){step=n;invalidate();form.querySelectorAll('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==n);document.querySelectorAll('[data-progress]').forEach(el=>{if(Number(el.dataset.progress)===n)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('back').hidden=n===1;const titles={1:'Next: liquid →',2:'Next: dose →',3:'Next: syringe →',4:'Review my numbers →'};$('next').textContent=titles[n];$('next').hidden=false;document.querySelector('.wizard-actions').hidden=false;if(focus)form.querySelector(`[data-step="${n}"] h2`).focus();}
function syncMode(){const vial=mode()==='vial';$('vial-fields').hidden=!vial;$('concentration-fields').hidden=vial;$('volume-fields').hidden=!vial;$('premixed-note').hidden=vial;$('vial').disabled=$('volume').disabled=!vial;$('concentration').disabled=vial;}
function syncSyringe(){const c=config();$('marking-fields').hidden=!c;$('increment').replaceChildren(new Option('Choose your line spacing',''));if(c)for(const n of c.ticks)$('increment').add(new Option(`${n} ${c.scale==='u100'?'unit'+(n===1?'':'s'):'mL'} per small line`,String(n)));}
function error(message,input){$('step-error').textContent=message;$('step-error').hidden=false;if(input)input.focus();}
function validateStep(){
 const fields=step===1?[mode()==='vial'?'vial':'concentration']:step===2&&mode()==='vial'?['volume']:step===3?['dose']:[];
 for(const id of fields)if(!$(id).value||!$(id).validity.valid||number(id)<=0){error('Enter a number greater than zero before continuing.',$(id));return false;}
 if(step===3&&!selected('dose-unit')){error('Choose mg or mcg. Match the unit written with your dose.');return false;}
 if(step===4&&!config()){error('Choose the syringe you have.');return false;}
 if(step===4&&!$('increment').value){error('Confirm how much one small line on your syringe is worth.',$('increment'));return false;}
 return true;
}
function inputs(){return {mode:mode(),vialMg:number('vial'),volumeMl:number('volume'),concentrationMgMl:number('concentration'),dose:number('dose'),doseUnit:selected('dose-unit'),...config(),increment:number('increment')};}
function review(){invalidate();form.querySelectorAll('[data-step]').forEach(el=>el.hidden=true);document.querySelector('.wizard-actions').hidden=true;const rows=mode()==='vial'?[['Peptide in vial',`${format(number('vial'))} mg`],['Liquid in vial',`${format(number('volume'))} mL`]]:[['Vial concentration',`${format(number('concentration'))} mg/mL`]];rows.push(['Your entered dose',`${format(number('dose'))} ${selected('dose-unit')} = ${format(selected('dose-unit')==='mcg'?number('dose')/1000:number('dose'))} mg`],['Your syringe',config().label],['Each small line',`${$('increment').value} ${config().scale==='u100'?'units':'mL'}`]);$('review-values').replaceChildren();for(const [label,value] of rows){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);$('review-values').append(row);} $('review').hidden=false;$('review').querySelector('h2').focus();}
form.addEventListener('input',()=>{if(!$('review').hidden)return;invalidate();});
form.addEventListener('change',event=>{if(event.target.id==='confirm'){ $('calculate-button').disabled=!event.target.checked;return;}invalidate();if(event.target.name==='mode')syncMode();if(event.target.name==='syringe')syncSyringe();});
form.addEventListener('submit',event=>{event.preventDefault();if(validateStep()){if(step<4)showStep(step+1);else review();}});
$('back').addEventListener('click',()=>showStep(step-1));$('edit-button').addEventListener('click',()=>showStep(1));
form.addEventListener('reset',()=>setTimeout(()=>{syncMode();syncSyringe();showStep(1);},0));
for(const button of form.querySelectorAll('[data-fill]'))button.addEventListener('click',()=>{$(button.dataset.fill).value=button.dataset.value;invalidate();});
function add(tag,text,className,parent=$('result')){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;parent.append(node);return node;}
$('calculate-button').addEventListener('click',()=>{
 if(!$('confirm').checked)return;
 const c=config(),data=calculate(inputs());$('result').replaceChildren();$('result').hidden=false;
 if(data.error||!data.measurable){add('h2',data.error?'Check these numbers before continuing':'This dose does not match a line on your syringe.');add('p',data.error||'The calculated volume falls between your syringe’s markings. Do not guess or round it yourself. Ask your pharmacist to confirm a measurable volume and appropriate syringe.','calc-alert');if(!data.error){const d=document.createElement('details');d.className='calc-help';const s=document.createElement('summary');s.textContent='See the math to discuss with your pharmacist';d.append(s);add('p',`Calculated volume: ${format(data.ml)} mL. Mathematical marking: ${format(data.marking)} ${c.scale==='u100'?'U-100 units':'mL'}. This is not a measurable line on the syringe you selected.`,null,d);$('result').append(d);}$('result').focus();return;}
 $('review').hidden=true;
 add('p','YOUR CALCULATED SYRINGE MARKING','eyebrow');add('h2',`${format(data.marking)} ${c.scale==='u100'?'units':'mL'}`,'result-number');add('p',c.label,'result-secondary');
 const graphic=syringeSVG(c.scale==='u100'?c.capacityMl*100:c.capacityMl,number('increment'),data.marking);graphic.classList.add('syringe-result');$('result').append(graphic);add('p','The highlighted line is your calculated marking. Illustration is not life-size.','calc-small');
 add('p',`Liquid volume: ${format(data.ml)} mL · Entered dose: ${format(number('dose'))} ${selected('dose-unit')}`,'result-secondary');
 const d=document.createElement('details');d.className='calc-help';d.open=false;const summary=document.createElement('summary');summary.textContent='Double-check the numbers';d.append(summary);add('p',`Dose: ${format(data.doseMg)} mg = ${format(data.doseMg*1000)} mcg. Concentration: ${format(data.concentration)} mg/mL.`,null,d);
 if(mode()==='vial')add('p',`${format(number('vial'))} mg ÷ ${format(number('volume'))} mL = ${format(data.concentration)} mg/mL.`,null,d);
 add('p',`${format(data.doseMg)} mg ÷ ${format(data.concentration)} mg/mL = ${format(data.ml)} mL.`,null,d);if(c.scale==='u100')add('p',`${format(data.ml)} mL × 100 = ${format(data.marking)} U-100 syringe units.`,null,d);
 add('p','Check the vial label and your dose instructions again. A correct conversion cannot verify that the dose or product is appropriate.','calc-small',d);$('result').append(d);
 const edit=document.createElement('button');edit.type='button';edit.textContent='Change numbers and check again';edit.addEventListener('click',()=>showStep(1));const actions=document.createElement('div');actions.className='calc-actions';actions.append(edit);$('result').append(actions);$('result').focus();
});
syncMode();syncSyringe();showStep(1,false);
