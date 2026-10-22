export class PatientManager {
  constructor(id = "patientData"){
    this.id = id;
    this.triageId = id + "Triage";
  }

  savePatient(patientData){
    localStorage.setItem(this.id, JSON.stringify(patientData));
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

  // Latest triage snapshot (vitals, symptoms, score, level)
  saveTriage(triageData){
    localStorage.setItem(this.triageId, JSON.stringify(triageData));
  }

  loadTriage(){
    const data = localStorage.getItem(this.triageId);
    return data ? JSON.parse(data) : null;
  }

  clearData() {
    localStorage.removeItem(this.id);
    localStorage.removeItem(this.triageId);
  }
}