// Clamps every <input type="number"> to its own min/max.
// While typing we only clamp the upper bound (so "3" on the way to "37"
// isn't forced up to the min); on blur/change we clamp both bounds.

function clamp(input, { enforceMin }) {
  if (input.value === "") return;

  let value = parseFloat(input.value);
  if (isNaN(value)) return;

  const min = input.min !== "" ? parseFloat(input.min) : -Infinity;
  const max = input.max !== "" ? parseFloat(input.max) : Infinity;

  let clamped = Math.min(value, max);
  if (enforceMin) clamped = Math.max(clamped, min);

  if (clamped !== value) {
    input.value = clamped;
    // let other modules (saturation ring, MAP, etc.) react to the correction
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("input", () => clamp(input, { enforceMin: false }));
  input.addEventListener("change", () => clamp(input, { enforceMin: true }));
  input.addEventListener("blur", () => {
    if (input.value === "") {
      // empty field: fall back to the default value from the HTML
      input.value = input.defaultValue;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      clamp(input, { enforceMin: true });
    }
  });
});