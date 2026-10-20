document.addEventListener('DOMContentLoaded', () => {
  const ecgSelect = document.getElementById('ecg__result');
  const ecgWaveContainer = document.querySelector('.ecg__wave');

  // Function to render the corresponding SVG image
  const updateEcgWave = (value) => {
  const waveContainers = document.querySelectorAll('.ecg__wave');
  if (!value) {
    waveContainers.forEach(c => c.innerHTML = '');
    return;
  }
  
  const imgTag = `<img src="assets/ecg/${value}.svg" alt="ECG: ${value}">`;
  waveContainers.forEach(c => c.innerHTML = imgTag);
  };

  // Listen for dropdown changes
  ecgSelect.addEventListener('change', (e) => {
    updateEcgWave(e.target.value);
  });

  // Render initial image if a value is selected by default
  updateEcgWave(ecgSelect.value);
});

// Change the selection to the option with value="orange"
ecgSelect.value = "orange"; 
