import { PatientManager } from '../database/patientManager.js';
import { enableRegisterForm } from "./registerForm.js";

const startPopup = document.querySelector(".start-popup");
const welcomePopup = document.querySelector(".welcome-popup");
const buttonYes = welcomePopup.querySelector("#button-yes");
const buttonNo = welcomePopup.querySelector("#button-no");

let loggedIn = false;

let patient = PatientManager.loadPatient();
if(!patient.name || !patient.cpf){
  loggedIn = false;
  alert("Nenhum login encontrado!");
} else {
  loggedIn = true;
}

if(loggedIn){startPopup.classList.add("hidden");} 

buttonNo.addEventListener("click", function() {
  if(!patient.name || !patient.cpf){alert("Nenhum login encontrado!"); return;}

  startPopup.classList.toggle("hidden");
})

buttonYes.addEventListener("click", function() {

  welcomePopup.classList.add("hidden");
  enableRegisterForm();
})
