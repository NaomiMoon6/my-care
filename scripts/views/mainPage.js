import { PatientManager } from '../database/patientManager.js';
import { exportReport } from '../modules/riskAlgorithm.js';

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

buttonReport.addEventListener("click", exportReport);

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