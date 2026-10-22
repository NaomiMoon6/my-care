import { PatientManager } from "../database/patientManager.js";
import { getSelectedSymptoms } from "./symptoms.js";
import { getGlucoseRisk } from "./glucose.js";

// ---------------------------------------------------------------------------
// Manchester levels
// floor: lowest score of the level's band
// extra: points added when the level is NOT the highest finding, so several
//        smaller findings can push the score up (yellow weighs more than green)
// ---------------------------------------------------------------------------
const LEVELS = {
  azul:     { name: "Azul",     rank: 0, floor: 0, extra: 0,    text: "Nenhum",     meaning: "Não urgente",   time: "até 240 minutos", glyph: "✓" },
  verde:    { name: "Verde",    rank: 1, floor: 2, extra: 0.4,  text: "Baixo",      meaning: "Pouco urgente", time: "até 120 minutos", glyph: "✓" },
  amarelo:  { name: "Amarelo",  rank: 2, floor: 4, extra: 0.75, text: "Médio",      meaning: "Urgente",       time: "50 a 60 minutos", glyph: "!" },
  laranja:  { name: "Laranja",  rank: 3, floor: 6, extra: 1.5,  text: "Alto",       meaning: "Muito urgente", time: "até 10 minutos",  glyph: "!" },
  vermelho: { name: "Vermelho", rank: 4, floor: 8, extra: 2,    text: "Emergência", meaning: "Emergência",    time: "imediato",        glyph: "!!" }
};

// Score -> level (upper limit of each band, exclusive)
const BANDS = [[2, "azul"], [4, "verde"], [6, "amarelo"], [8, "laranja"], [Infinity, "vermelho"]];
const levelFromScore = (score) => BANDS.find(([max]) => score < max)[1];

// ---------------------------------------------------------------------------
// Classifiers. On a boundary between two abnormal bands the more severe one
// wins; the limits of the normal range stay normal.
// ---------------------------------------------------------------------------
function temperatureLevel(t) {
  if (t > 39 || t < 28) return "vermelho";
  if (t >= 38.5 || t < 32) return "laranja";
  if (t >= 37.8 || t <= 35) return "amarelo";
  if (t >= 37.5 || t < 36) return "verde"; // 35-36 is not in the reference: treated as green
  return "azul";
}

function saturationLevel(s) {
  if (s < 85) return "vermelho";
  if (s <= 90) return "laranja";
  if (s <= 94) return "amarelo";
  if (s < 96) return "verde"; // 96-98 is not in the reference: treated as normal
  return "azul";
}

function heartRateLevel(hr) {
  if (hr > 140 || hr < 40) return "vermelho";
  if (hr >= 120 || hr <= 50) return "laranja";
  if (hr > 100 || hr < 60) return "amarelo";
  return "azul";
}

const mapOf = (sys, dia) => Math.trunc((sys + 2 * dia) / 3); // same formula as bloodPressure.js

function bloodPressureLevel(sys, dia) {
  const map = mapOf(sys, dia);
  if (dia > sys) return "laranja"; // impossible reading: needs to be rechecked
  if (map <= 60) return "vermelho";
  if (map >= 110) return "laranja";
  if (map > 100 || map < 70) return "amarelo";
  return "azul";
}

const GLUCOSE_LEVEL = { baixo: "azul", medio: "amarelo", alto: "laranja" };

const ECG = {
  "sinus-rythm":     { label: "Ritmo sinusal",                 level: "azul" },
  bradycardia:       { label: "Bradicardia",                   level: "amarelo" },
  tachycardia:       { label: "Taquicardia",                   level: "amarelo" },
  afib:              { label: "Fibrilação atrial",             level: "laranja" },
  "atrial-flutter":  { label: "Flutter atrial",                level: "laranja" },
  "qt-prolongation": { label: "Prolongamento do intervalo QT", level: "laranja" },
  vtach:             { label: "Taquicardia ventricular",       level: "vermelho" }
};

// ---------------------------------------------------------------------------
// Reading the inputs
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const num = (id) => {
  const value = parseFloat($(id).value);
  return Number.isFinite(value) ? value : null;
};
const when = (value, fn) => (value === null ? null : fn(value));

function readVitals() {
  return {
    temperature: num("temperature-input"),
    glucose: num("glucose-input"),
    glucoseMeal: $("glucose-meal").selectedOptions[0].textContent,
    diabetic: $("glucose-diabetic").checked,
    saturation: num("saturation-input"),
    heartRate: num("hr-input"),
    systolic: num("bp-systolic-input"),
    diastolic: num("bp-diastolic-input"),
    ecg: $("ecg__result").value
  };
}

// ---------------------------------------------------------------------------
// Algorithm: the highest finding sets the band, every other finding adds points
// ---------------------------------------------------------------------------
function calculateScore(levels) {
  const sorted = levels
    .filter((level) => LEVELS[level])
    .sort((a, b) => LEVELS[b].rank - LEVELS[a].rank);
  if (!sorted.length) return 0;

  const [top, ...others] = sorted;
  const extra = others.reduce((sum, level) => sum + LEVELS[level].extra, 0);
  return Math.round(Math.min(10, LEVELS[top].floor + extra) * 10) / 10;
}

function assess() {
  const v = readVitals();
  const symptoms = getSelectedSymptoms();
  const glucoseRisk = getGlucoseRisk();
  const hasBp = v.systolic !== null && v.diastolic !== null;
  const ecg = ECG[v.ecg] ?? { label: "Não informado", level: null };

  const vitals = [
    {
      name: "Temperatura corporal",
      value: when(v.temperature, (t) => `${t.toFixed(1)} °C`),
      level: when(v.temperature, temperatureLevel)
    },
    {
      name: "Glicose",
      value: when(v.glucose, (g) => `${g} mg/dL (${v.glucoseMeal}${v.diabetic ? ", diabético(a)" : ""})`),
      level: glucoseRisk ? GLUCOSE_LEVEL[glucoseRisk] : null
    },
    {
      name: "Saturação de oxigênio",
      value: when(v.saturation, (s) => `${s} %`),
      level: when(v.saturation, saturationLevel)
    },
    {
      name: "Frequência cardíaca",
      value: when(v.heartRate, (hr) => `${hr} bpm`),
      level: when(v.heartRate, heartRateLevel)
    },
    {
      name: "Pressão arterial",
      value: hasBp ? `${v.systolic}/${v.diastolic} mm Hg (PAM ${mapOf(v.systolic, v.diastolic)})` : null,
      level: hasBp ? bloodPressureLevel(v.systolic, v.diastolic) : null
    },
    { name: "Eletrocardiograma", value: ecg.label, level: ecg.level }
  ];

  const levels = [...symptoms.map((s) => s.level.toLowerCase()), ...vitals.map((x) => x.level)];
  const score = calculateScore(levels);

  return { score, level: levelFromScore(score), vitals, symptoms };
}

// ---------------------------------------------------------------------------
// Risk block
// ---------------------------------------------------------------------------
const block = document.querySelector(".priority-level");
const ui = {
  glyph: block.querySelector(".priority-level__glyph"),
  value: block.querySelector(".priority-level__value"),
  score: block.querySelector(".priority-level__score"),
  time: block.querySelector(".priority-level__time")
};

function render({ level, score }) {
  const info = LEVELS[level];
  block.dataset.level = level;
  ui.glyph.textContent = info.glyph;
  ui.value.textContent = info.text;
  ui.score.textContent = `Pontuação: ${score.toFixed(1)} / 10`;
  ui.time.textContent = `Tempo até o atendimento: ${info.time}`;
}

function update() {
  const result = assess();
  render(result);
  PatientManager.saveTriage({
    updatedAt: new Date().toISOString(),
    score: result.score,
    level: result.level,
    vitals: result.vitals,
    symptoms: result.symptoms
  });
}

// Every input/select/checkbox in the page, plus the symptoms list
const page = document.querySelector(".page");
["input", "change", "symptoms:change"].forEach((type) => page.addEventListener(type, update));
update();

// ---------------------------------------------------------------------------
// PDF report
// ---------------------------------------------------------------------------
const esc = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function buildReport(result, patient) {
  const info = LEVELS[result.level];
  const birth = patient.birthday || patient.birthdateInput || "";
  const birthText = /^\d{4}-\d{2}-\d{2}$/.test(birth) ? birth.split("-").reverse().join("/") : birth;

  const chip = (level) => `<span class="report__chip" data-level="${level}">${LEVELS[level].name}</span>`;
  const field = (label, value) =>
    `<div class="report__field"><span class="report__label">${label}</span><span class="report__data">${esc(value || "—")}</span></div>`;

  const vitalRows = result.vitals
    .map((v) => `<tr><td>${v.name}</td><td>${esc(v.value ?? "Não informado")}</td><td>${v.level ? chip(v.level) : "—"}</td></tr>`)
    .join("");

  const symptomItems = result.symptoms.length
    ? [...result.symptoms]
        .sort((a, b) => LEVELS[b.level.toLowerCase()].rank - LEVELS[a.level.toLowerCase()].rank)
        .map((s) => `<li class="report__item"><span>${esc(s.text)} <small>(${esc(s.location)})</small></span>${chip(s.level.toLowerCase())}</li>`)
        .join("")
    : '<li class="report__item">Nenhum sintoma selecionado.</li>';

  return `
    <div class="report">
      <div class="report__header">
        <h1 class="report__title">Ficha de <span class="red-span">Triagem</span></h1>
        <span class="report__date">Emitida em ${new Date().toLocaleString("pt-BR")}</span>
      </div>

      <section class="report__section report__risk" data-level="${result.level}">
        <h2 class="report__heading">Nível de risco</h2>
        <div class="report__risk-value">${info.text}</div>
        <p class="report__risk-info">Código Manchester: <b class="bold">${info.name}</b> — ${info.meaning}</p>
        <p class="report__risk-info">Pontuação: ${result.score.toFixed(1)} / 10 · Tempo até o atendimento: ${info.time}</p>
      </section>

      <section class="report__section">
        <h2 class="report__heading">Dados do paciente</h2>
        <div class="report__grid">
          ${field("Nome", patient.name)}
          ${field("CPF", patient.cpf)}
          ${field("Telefone", patient.phone)}
          ${field("E-mail", patient.email)}
          ${field("Data de nascimento", birthText)}
        </div>
      </section>

      <section class="report__section">
        <h2 class="report__heading">Sinais vitais</h2>
        <table class="report__table"><tbody>${vitalRows}</tbody></table>
      </section>

      <section class="report__section">
        <h2 class="report__heading">Sintomas relatados</h2>
        <ul class="report__list">${symptomItems}</ul>
      </section>

      <p class="report__note">Documento gerado pelo protótipo Sistema Web de Triagem (protocolo de Manchester). Não substitui a avaliação de um profissional de saúde.</p>
    </div>`;
}

export function exportReport() {
  const patient = PatientManager.loadPatient();
  const slug = (patient.name || "")
    .trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, "-");

  // html2pdf measures the element, so it must be laid out (off-screen is fine)
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;";
  holder.innerHTML = buildReport(assess(), patient);
  document.body.appendChild(holder);

  const cleanup = () => holder.remove();

  window
    .html2pdf()
    .set({
      margin: 10,
      filename: `ficha-de-triagem${slug ? "-" + slug : ""}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ".report__section" }
    })
    .from(holder.firstElementChild)
    .save()
    .then(cleanup)
    .catch((error) => { console.error(error); cleanup(); });
}