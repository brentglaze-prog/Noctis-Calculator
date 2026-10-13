export function calculate({mode, vialMg, volumeMl, concentrationMgMl, dose, doseUnit, capacityMl, scale, increment}) {
  const positive = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;
  if (!['vial', 'concentration'].includes(mode) || !['mg', 'mcg'].includes(doseUnit) || !['u100', 'ml'].includes(scale)) return {error: 'Check the selected units and calculation mode.'};
  if (![dose, capacityMl, increment].every(positive)) return {error: 'Enter a positive dose and select your syringe and smallest marking.'};
  if (mode === 'vial' && ![vialMg, volumeMl].every(positive)) return {error: 'Enter the total peptide amount and final mixed volume.'};
  if (mode === 'concentration' && !positive(concentrationMgMl)) return {error: 'Enter the concentration printed on your vial label.'};
  const concentration = mode === 'vial' ? vialMg / volumeMl : concentrationMgMl;
  const doseMg = doseUnit === 'mcg' ? dose / 1000 : dose;
  const ml = doseMg / concentration;
  const marking = scale === 'u100' ? ml * 100 : ml;
  if (![concentration, doseMg, ml, marking].every(positive)) return {error: 'These values are outside the supported numeric range.'};
  const tolerance = Number.EPSILON * 32 * Math.max(1, capacityMl, ml);
  if (mode === 'vial' && doseMg > vialMg + Number.EPSILON * 32 * Math.max(vialMg, doseMg)) return {error: 'The dose exceeds the total peptide amount in this vial.'};
  if (ml > capacityMl + tolerance) return {error: 'The calculated volume exceeds this syringe’s capacity. Check your inputs and confirm the appropriate syringe with your pharmacist.'};
  const steps = marking / increment;
  const measurable = Math.abs(steps - Math.round(steps)) <= Number.EPSILON * 32 * Math.max(1, steps);
  return {concentration, doseMg, ml, marking, measurable, dosesPerVial: mode === 'vial' ? Math.floor(vialMg / doseMg + Number.EPSILON * 32 * Math.max(1, vialMg / doseMg)) : null};
}

// Significant digits preserve small doses instead of rounding them to zero.
export function format(n) { return Number(n.toPrecision(8)).toString(); }
