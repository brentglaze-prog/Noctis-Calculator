import {calculate, format} from './math.mjs';
const form = document.querySelector('#peptide-form');
const result = document.querySelector('#result');
const syringes = {
  u30: {capacityMl: 0.3, scale: 'u100', ticks: [0.5, 1]},
  u50: {capacityMl: 0.5, scale: 'u100', ticks: [0.5, 1, 2]},
  u100: {capacityMl: 1, scale: 'u100', ticks: [1, 2]},
  ml1: {capacityMl: 1, scale: 'ml', ticks: [0.01, 0.02]},
  ml3: {capacityMl: 3, scale: 'ml', ticks: [0.1, 0.2]}
};
const value = id => Number(document.querySelector('#' + id).value);
const field = id => document.querySelector('#' + id);
function clearResult() { result.hidden = true; result.replaceChildren(); }
function syncMode() {
  const vial = field('mode').value === 'vial';
  field('vial-fields').hidden = !vial;
  field('concentration-fields').hidden = vial;
  field('vial').required = field('volume').required = vial;
  field('concentration').required = !vial;
  field('vial').disabled = field('volume').disabled = !vial;
  field('concentration').disabled = vial;
  clearResult();
}
function syncSyringe() {
  const config = syringes[field('syringe').value];
  field('increment').replaceChildren(new Option('Select the smallest marking', ''));
  for (const n of config.ticks) field('increment').add(new Option(`${n} ${config.scale === 'u100' ? 'unit' : 'mL'}${n > 1 && config.scale === 'u100' ? 's' : ''}`, String(n)));
  clearResult();
}
form.addEventListener('input', clearResult);
field('mode').addEventListener('change', syncMode);
field('syringe').addEventListener('change', syncSyringe);
form.addEventListener('reset', () => { queueMicrotask(() => { syncMode(); syncSyringe(); }); });
for (const button of document.querySelectorAll('[data-fill]')) button.addEventListener('click', () => { field(button.dataset.fill).value = button.dataset.value; clearResult(); });
function add(tag, text, className) { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; result.append(node); return node; }
form.addEventListener('submit', event => {
  event.preventDefault();
  clearResult();
  const config = syringes[field('syringe').value];
  const data = calculate({mode: field('mode').value, vialMg: value('vial'), volumeMl: value('volume'), concentrationMgMl: value('concentration'), dose: value('dose'), doseUnit: field('dose-unit').value, ...config, increment: value('increment')});
  result.hidden = false;
  if (data.error) { add('h2', 'Check your inputs'); add('p', data.error, 'calc-alert'); return; }
  add('p', 'CALCULATED VOLUME', 'eyebrow');
  add('h2', `${format(data.ml)} mL`, 'calc-volume');
  add('p', config.scale === 'u100' ? `${format(data.marking)} units on a U-100 syringe` : `${format(data.ml)} mL on an mL-marked syringe`, 'calc-marking');
  add('p', `Dose: ${format(data.doseMg)} mg (${format(data.doseMg * 1000)} mcg) · Concentration: ${format(data.concentration)} mg/mL`);
  if (config.scale === 'u100') add('p', 'U-100 syringe units are volume markings: 100 units = 1 mL. They are not the peptide dose or IU.');
  if (!data.measurable) add('p', 'This result falls between the selected syringe markings. Do not round it yourself. Ask your pharmacist to confirm a measurable volume and appropriate syringe.', 'calc-alert');
  else add('p', 'This volume aligns with the smallest marking you selected. Confirm it matches the vial label and pharmacy instructions.', 'calc-confirm');
  if (data.dosesPerVial !== null) add('p', `Theoretical full doses per vial: ${data.dosesPerVial}. Does not account for dead space, waste, or beyond-use limits.`, 'calc-small');
  add('p', 'The displayed values use up to 8 significant digits; the marking check uses the unrounded calculation.', 'calc-small');
});
syncMode(); syncSyringe();
