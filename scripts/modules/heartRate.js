const hrInput = document.getElementById('hr-input');
const heartSvg = document.querySelector('.heart-rate__heart');

function updateHeartRate() {
  const bpm = parseFloat(hrInput.value);

  // Validate the input to avoid division by zero or negative/weird numbers
  if (bpm > 0) {
    const secondsPerBeat = 60 / bpm;
    // Update the CSS variable dynamically
    heartSvg.style.setProperty('--pulse-duration', `${secondsPerBeat}s`);
  }
}

// Listen for changes as the user types or uses the arrows
hrInput.addEventListener('input', updateHeartRate);

// Run it once on load to set the initial 60 BPM (1s) state
updateHeartRate();