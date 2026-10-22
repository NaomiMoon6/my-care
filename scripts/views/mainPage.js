import { PatientManager } from '../database/patientManager.js';

let patient = PatientManager.loadPatient();

const welcomeText = document.querySelector(".header__welcome");

export function setWelcomeText() {
  patient = PatientManager.loadPatient();
  const nameArray = patient.name.split(" ");

  welcomeText.textContent = "Olá, " + nameArray[0];
}

setWelcomeText();

const startPopup = document.querySelector(".start-popup");
const configPopup = document.querySelector(".config-popup__bg");
const buttonConfig = document.getElementById("button-config");
const buttonClose = document.querySelectorAll(".close-button");
const buttonReport = document.getElementById("button-report");
const buttonLogOut= document.getElementById("button-logout");
const buttonDelete = document.getElementById("button-delete");

buttonConfig.addEventListener("click", function() {

  configPopup.classList.remove("hidden");
})

buttonLogOut.addEventListener("click", function() {

  startPopup.classList.remove("hidden");
  location.reload();
})

buttonDelete.addEventListener("click", function() {
  PatientManager.clearData();
  location.reload();
})

buttonClose.forEach((button) => {
  button.addEventListener("click", () => {
    button.closest('[class*="popup__bg"]').classList.add("hidden");
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".nav__button");
  if (!button) return;

  const targetId = button.dataset.target;
  const targetBlock = document.getElementById(targetId);
  const blocks = document.querySelectorAll(".symptom-input__block");
  
  blocks.forEach((block) => block.classList.add("hidden"));
  targetBlock.classList.remove("hidden");  
});







// Function to collect all vital signs and user inputs from the blocks
function getTriageData() {
  return {
    symptoms: document.getElementById("symptoms-block")?.innerText.trim(), // Adjust based on how symptoms are structured
    bodyTemp: document.getElementById("temperature-input")?.value,
    glucose: document.getElementById("glucose-input")?.value || null,
    saturation: document.getElementById("saturation-input")?.value || null,
    heartRate: document.getElementById("hr-input")?.value || null,
    bloodPressure: {
      systolic: document.getElementById("bp-systolic-input")?.value || null,
      diastolic: document.getElementById("bp-diastolic-input")?.value || null
    },
    ecgResult: document.getElementById("ecg__result")?.value,
    cycle: document.getElementById("cycle-block")?.querySelector("input")?.value || null
  };
}

// Example usage when clicking your export/report button:
buttonReport.addEventListener("click", () => {
  const triageData = getTriageData();
  
  // Save to localStorage or PatientManager
  
  console.log("Dados salvos com sucesso:", triageData);
});

buttonReport.addEventListener("click", () => {
  // 1. Select the element you want to turn into a PDF 
  // (You can point this to a specific container or wrapper div)
  const element = document.querySelector(".page"); 

  // 2. Configure your PDF options
  const options = {
    margin:       10, // mm
    filename:     'ficha-de-triagem.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true }, // scale 2 improves sharpness
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // 3. Generate and download the PDF
  html2pdf().from(element).set(options).save();
});

// Listen to any change or input inside the main content area
document.querySelector(".page").addEventListener("input", (event) => {
  const input = event.target;
  
  // Make sure the target is actually an input, select, or textarea
  if (!input.matches("input, select, textarea")) return;

  // Get current complete state or update specific field
  const currentData = getTriageData(); // Using the helper function from Method 1
  
  // Save continuously to localStorage or your PatientManager
  
});