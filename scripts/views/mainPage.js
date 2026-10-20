import { PatientManager } from '../database/patientManager.js';

let patient = PatientManager.loadPatient();

const welcomeText = document.querySelector(".header__welcome");

if(!patient.name || !patient.cpf){
    
} else {
  welcomeText.textContent = "Olá, " + patient.name;
}

const startPopup = document.querySelector(".start-popup");
const buttonLogOut= document.getElementById("button-logout");

buttonLogOut.addEventListener("click", function() {

  startPopup.classList.remove("hidden");
  location.reload();
})

const buttonDelete = document.getElementById("button-delete");

buttonDelete.addEventListener("click", function() {
  PatientManager.clearData();
  location.reload();
})

document.addEventListener("click", (event) => {
  const button = event.target.closest(".nav__button");
  if (!button) return;

  const targetId = button.dataset.target;
  const targetBlock = document.getElementById(targetId);
  const blocks = document.querySelectorAll(".symptom-input__block");
  
  blocks.forEach((block) => block.classList.add("hidden"));
  targetBlock.classList.remove("hidden");  
});