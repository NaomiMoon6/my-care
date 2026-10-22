const slider = document.getElementById('temperature-slider');
const input = document.getElementById('temperature-input');

function updateSliderFill(value) {
  const min = parseFloat(slider.min) || 30;
  const max = parseFloat(slider.max) || 42;
  const val = parseFloat(value);
  
  // Prevent NaN if value is empty or invalid
  if (isNaN(val)) return; 
     
  // Calculate percentage filled
  const percentage = ((val - min) / (max - min)) * 100;
     
  // Update the CSS variable controlling the gradient height
  slider.style.setProperty('--percent', `${percentage}%`);
}

function updateInputValue(value){
  input.value = value;
}

function updateSliderValue(value){
  slider.value = value;
}

//Pass the slider's current value on initial load
updateSliderFill(slider.value);

slider.addEventListener('input', () => updateSliderFill(slider.value));
slider.addEventListener('input', () => updateInputValue(slider.value));

input.addEventListener('input', () => updateSliderFill(input.value));
input.addEventListener('input', () => updateSliderValue(input.value));