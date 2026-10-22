const systolicInput = document.getElementById('bp-systolic-input');
const diastolicInput = document.getElementById('bp-diastolic-input');

const mapDisplay = document.querySelector('.bp-map-display');

function updateMap(){
  let systolic = parseInt(systolicInput.value);
  let diastolic = parseInt(diastolicInput.value);
  let map = parseInt((systolic + (2 * diastolic)) / 3);

  mapDisplay.textContent = map;

  if (map >= 110) 
    {mapDisplay.style.borderColor = "#f3c7c7"; mapDisplay.style.backgroundColor = "#e87474";}
  else if (map < 110 && map > 100) 
    {mapDisplay.style.borderColor = "#ecf0cb"; mapDisplay.style.backgroundColor = "#e4e874";}
  else if (map <= 100 && map >= 70) 
    {mapDisplay.style.borderColor = "#cbf0cf"; mapDisplay.style.backgroundColor = "#74e88f";}
  else if (map < 70 && map > 60) 
    {mapDisplay.style.borderColor = "#ecf0cb"; mapDisplay.style.backgroundColor = "#e4e874";}
  else if (map <= 60) 
    {mapDisplay.style.borderColor = "#f3c7c7"; mapDisplay.style.backgroundColor = "#e87474";}

  if (diastolic > systolic) {mapDisplay.style.borderColor = "#f3c7c7"; mapDisplay.style.backgroundColor = "#e87474";}
}

systolicInput.addEventListener("input", updateMap);
diastolicInput.addEventListener("input", updateMap);

updateMap();