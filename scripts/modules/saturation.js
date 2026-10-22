const input = document.getElementById('saturation-input');
const circle = document.querySelector('.saturation-ring');
const progressBar = document.querySelector('.saturation-bar__big');

// 1. Calculate the circumference based on the radius (r = 50)
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

// 2. Set initial SVG stroke properties
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clampedPercent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function changeColor() {
  if(input.value < 90){progressBar.style.stroke = 'url(#redToBlue)';}
  else {progressBar.style.stroke = 'url(#blueToBlue)';}
}

// 3. Update progress bar live as the user types
input.addEventListener('input', (e) => {
  setProgress(e.target.value);
  changeColor();
});

setProgress(input.value);