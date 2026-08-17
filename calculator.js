"use strict";

const form = document.getElementById("calculator-form");
const resetButton = document.getElementById("resetButton");

const results = document.getElementById("results");
const errorMessage = document.getElementById("errorMessage");

const concentrationResult =
  document.getElementById("concentrationResult");

const volumeResult =
  document.getElementById("volumeResult");

const syringeResult =
  document.getElementById("syringeResult");

const formulaResult =
  document.getElementById("formulaResult");


/**
 * Convert peptide quantities to micrograms.
 *
 * Using mcg internally gives us one consistent base unit
 * and prevents mg/mcg conversion errors.
 */
function convertToMcg(amount, unit) {
  if (unit === "mg") {
    return amount * 1000;
  }

  return amount;
}


/**
 * Format numbers without unnecessary trailing zeros.
 */
function formatNumber(value, maxDecimals = 4) {
  return Number(value.toFixed(maxDecimals)).toString();
}


/**
 * Validate that a value is finite and greater than zero.
 */
function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}


/**
 * Main calculator.
 *
 * Formula:
 *
 * (Target Dose / Total Peptide Amount)
 * × Reconstitution Volume
 * = Required Draw Volume
 */
function calculate(event) {
  event.preventDefault();

  errorMessage.hidden = true;
  results.hidden = true;

  const peptideAmount = parseFloat(
    document.getElementById("peptideAmount").value
  );

  const peptideUnit =
    document.getElementById("peptideUnit").value;

  const waterVolume = parseFloat(
    document.getElementById("waterVolume").value
  );

  const targetDose = parseFloat(
    document.getElementById("targetDose").value
  );

  const doseUnit =
    document.getElementById("doseUnit").value;

  const syringeUnitsPerMl = parseInt(
    document.getElementById("syringeType").value,
    10
  );


  // -----------------------------
  // INPUT VALIDATION
  // -----------------------------

  if (
    !isPositiveNumber(peptideAmount) ||
    !isPositiveNumber(waterVolume) ||
    !isPositiveNumber(targetDose)
  ) {
    showError(
      "Enter values greater than zero for peptide amount, " +
      "reconstitution volume, and target dose."
    );

    return;
  }


  // -----------------------------
  // NORMALIZE UNITS
  // -----------------------------

  const totalPeptideMcg =
    convertToMcg(peptideAmount, peptideUnit);

  const targetDoseMcg =
    convertToMcg(targetDose, doseUnit);


  if (targetDoseMcg > totalPeptideMcg) {
    showError(
      "The requested target dose exceeds the total amount " +
      "of peptide entered for the vial."
    );

    return;
  }


  // -----------------------------
  // CALCULATIONS
  // -----------------------------

  // Concentration expressed as mg/mL.
  const totalPeptideMg =
    totalPeptideMcg / 1000;

  const concentrationMgPerMl =
    totalPeptideMg / waterVolume;


  // Required draw volume.
  //
  // Formula:
  // target / total × water volume
  const drawVolumeMl =
    (targetDoseMcg / totalPeptideMcg) *
    waterVolume;


  // Insulin syringe units.
  //
  // U-100:
  // 1 mL = 100 units
  //
  // U-40:
  // 1 mL = 40 units
  const syringeUnits =
    drawVolumeMl * syringeUnitsPerMl;


  // -----------------------------
  // OUTPUT
  // -----------------------------

  concentrationResult.textContent =
    `${formatNumber(concentrationMgPerMl, 6)} mg/mL`;

  volumeResult.textContent =
    `${formatNumber(drawVolumeMl, 6)} mL`;

  syringeResult.textContent =
    `${formatNumber(syringeUnits, 3)} units on a ` +
    `U-${syringeUnitsPerMl} syringe`;

  formulaResult.textContent =
    `(${formatNumber(targetDoseMcg)} mcg ÷ ` +
    `${formatNumber(totalPeptideMcg)} mcg) × ` +
    `${formatNumber(waterVolume)} mL = ` +
    `${formatNumber(drawVolumeMl, 6)} mL`;

  results.hidden = false;
}


/**
 * Display a calculation/input error.
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}


/**
 * Reset the calculator.
 */
function resetCalculator() {
  form.reset();

  results.hidden = true;
  errorMessage.hidden = true;

  concentrationResult.textContent = "—";
  volumeResult.textContent = "—";
  syringeResult.textContent = "—";
  formulaResult.textContent = "";
}


form.addEventListener("submit", calculate);

resetButton.addEventListener(
  "click",
  resetCalculator
);