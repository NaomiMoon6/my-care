patient.js

export class patientManager {
  constructor(id = "patientData"){
    this.id = id;
  }

  savePatient(patientData){
    const data = JSON.stringify(patientData);
    localStorage.setItem(this.id, jsonString);
  }

  loadPatient(){
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return {
        id: 0,
        name: "",
        cpf: "",
        phone: "",
        email: "",
        birthday: ""
      };
    }
    return JSON.parse(data);
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

patientManager.js

import { patientManager } from "./patient";

export const PatientManager = new patientManager();

registerForm.js

import { PatientManager } from '../database/patientManager.js';

const startPopup = document.querySelector(".start-popup");
const welcomePopup = document.querySelector(".welcome-popup");
const registerFormToggle = startPopup.querySelector(".register-form-popup");
const registerForm = welcomePopup.querySelector(".register-form");
const continueButton = document.querySelector(".register-form-next");

export function enableRegisterForm(){
  registerFormToggle.classList.remove("hidden");
}

const field1 = document.getElementById("form-field-1");
const field2 = document.getElementById("form-field-2");
const field3 = document.getElementById("form-field-3");
const field4 = document.getElementById("form-field-4");
const field5 = document.getElementById("form-field-5");

let field = 1;

const nameInput = field1.querySelector(".register-input");
const cpfInput = field2.querySelector(".register-input");
const phoneInput = field3.querySelector(".register-input");
const emailInput = field4.querySelector(".register-input");
const birthdateInput = field5.querySelector(".register-input");

function formSubmit(){
  const patientData = {
    name: nameInput.value,
    cpf: cpfInput.value,
    phone: phoneInput.value,
    email: emailInput.value,
    birthdateInput: birthdateInput.value
  }

  return patientData;
}

continueButton.addEventListener("click", function(){
  switch (field) {
    case 1: 
      field1.classList.add("hidden");
      field2.classList.remove("hidden");
      field = 2;
      break;
    case 2: 
      field2.classList.add("hidden");
      field3.classList.remove("hidden");
      field = 3;
      break;
    case 3: 
      field3.classList.add("hidden");
      field4.classList.remove("hidden");
      field = 4;
      break;
    case 4: 
      field4.classList.add("hidden");
      field5.classList.remove("hidden");
      field = 5;
      break;
    case 5:
      const newPatient = formSubmit();
      PatientManager.save(newPatient);

      registerForm.reset();

      field5.classList.add("hidden");
      field1.classList.remove("hidden");
      field = 1;
      break;
  }
});

welcomePopup.js 

import { PatientManager } from '../database/patientManager.js';
import { enableRegisterForm } from "./registerForm.js";

const startPopup = document.querySelector(".start-popup");
const welcomePopup = document.querySelector(".welcome-popup");
const buttonYes = welcomePopup.querySelector("#button-yes");
const buttonNo = welcomePopup.querySelector("#button-no");
const buttonLogOut= document.getElementById("button-logout");

let loggedIn = false;

if(loggedIn){welcomePopup.classList.add("hidden");} 

buttonNo.addEventListener("click", function() {
  loggedIn = true;

  startPopup.classList.toggle("hidden");
})

buttonYes.addEventListener("click", function() {
  loggedIn = false;

  welcomePopup.classList.add("hidden");
  enableRegisterForm();
})

buttonLogOut.addEventListener("click", function() {
  loggedIn = false;
  startPopup.classList.remove("hidden");
})

file structure:
root/scripts/database/patient.js
root/scripts/database/patientManager.js
root/scripts/views/registerForm.js
root/scripts/views/welcomePopup.js

how do I make this work and which file do I import to the html? is there a way to centralize it more?
