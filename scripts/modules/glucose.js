const glucoseInput = document.getElementById('glucose-input');
const mealSelect = document.getElementById('glucose-meal');
const diabeticCheck = document.getElementById('glucose-diabetic');
const riskText = document.getElementById('glucose-risk');

// Glucose (mg/dL) at which "medio" risk begins, depending on last meal
const HIGH_LIMIT = {
  normal: { fasting: 100, "post-meal": 140, unknown: 200 },
  diabetic: { fasting: 130, "post-meal": 180, unknown: 200 }
};

// Below this value risk is at least "medio"
const LOW_LIMIT = { normal: 70, diabetic: 80 };

export function getGlucoseRisk() {
  const glucose = parseFloat(glucoseInput.value);
  if (isNaN(glucose)) return null;

  const profile = diabeticCheck.checked ? "diabetic" : "normal";

  // Hypoglycemia does not depend on the last meal
  // (diabetics, especially on insulin, are in danger sooner)
  if (glucose < (profile === "diabetic" ? 70 : 54)) return "alto";
  if (glucose < LOW_LIMIT[profile]) return "medio";

  // Severe hyperglycemia, independent of the last meal
  if (glucose >= 250) return "alto";

  if (glucose >= HIGH_LIMIT[profile][mealSelect.value]) return "medio";

  return "baixo";
}

const RISK_LABEL = { baixo: "Baixo", medio: "Médio", alto: "Alto" };

function updateRiskText() {
  const risk = getGlucoseRisk();

  riskText.classList.remove("glucose-risk_baixo", "glucose-risk_medio", "glucose-risk_alto");

  if (!risk) {
    riskText.textContent = "";
    return;
  }

  riskText.textContent = "Risco " + RISK_LABEL[risk];
  riskText.classList.add("glucose-risk_" + risk);
}

glucoseInput.addEventListener('input', updateRiskText);
mealSelect.addEventListener('change', updateRiskText);
diabeticCheck.addEventListener('change', updateRiskText);

updateRiskText();