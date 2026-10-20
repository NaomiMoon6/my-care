const slider = document.getElementById('temperature-slider');

function updateSliderFill() {
  const min = parseFloat(slider.min) || 36;
  const max = parseFloat(slider.max) || 40;
  const val = parseFloat(slider.value);
  
  // Calculate percentage filled
  const percentage = ((val - min) / (max - min)) * 100;
  
  // Update the CSS variable controlling the gradient height
  slider.style.setProperty('--percent', `${percentage}%`);
}

// Initial set
updateSliderFill();

// Update on user movement
slider.addEventListener('input', updateSliderFill);