export class PatientManager {
  constructor(id = "patientData"){
    this.id = id;
  }

  savePatient(patientData){
    const data = JSON.stringify(patientData);
    localStorage.setItem(this.id, data);
  }

  loadPatient(){
    const data = localStorage.getItem(this.id);
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

  clearData() {
    localStorage.removeItem(this.id);
  }
}
