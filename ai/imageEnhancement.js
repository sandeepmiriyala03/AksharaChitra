// imageEnhancement.js (SAFE VERSION)

// ----------------------------
// 1. Detect when OpenCV is ready
// ----------------------------
let cvReady = false;

function onCvReady() {
  cvReady = true;
  console.log("OpenCV.js is fully initialized!");
}

// If cv already exists:
if (window.cv) {
  cv['onRuntimeInitialized'] = onCvReady;
} else {
  console.warn("⚠ OpenCV not loaded yet. imageEnhancement.js loaded too early.");
}


// ----------------------------
// 2. Safe enhancer function
// ----------------------------
function enhanceImage() {
  if (!cvReady) {
    console.error("❌ OpenCV.js is not initialized yet.");
    return;
  }

  const imgElement = document.getElementById('cropImage');
  if (!imgElement) {
    console.error("❌ cropImage element not found!");
    return;
  }

  // Create OpenCV MAT
  let src = cv.imread(imgElement);
  let dst = new cv.Mat();

  // Slider values
  let brightness = parseInt(document.getElementById('brightness').value);
  let contrast = parseFloat(document.getElementById('contrast').value);

  // Apply enhancement
  src.convertTo(dst, -1, contrast, brightness);

  // Output canvas
  const canvas = document.getElementById('outputCanvas');
  if (!canvas) {
    console.error("❌ outputCanvas not found!");
    return;
  }

  canvas.width = src.cols;
  canvas.height = src.rows;

  cv.imshow(canvas, dst);

  // Cleanup
  src.delete();
  dst.delete();
}

// Expose globally
window.enhanceImage = enhanceImage;


// ----------------------------
// 3. Wait for DOM before adding listeners
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const b = document.getElementById('brightness');
  const c = document.getElementById('contrast');

  if (!b || !c) {
    console.error("❌ Brightness/Contrast sliders not found in DOM.");
    return;
  }

  b.addEventListener("input", enhanceImage);
  c.addEventListener("input", enhanceImage);

  console.log("✔ Brightness/Contrast listeners attached.");
});


// ----------------------------
// 4. Helper: return edited image export
// ----------------------------
window.getEnhancedImageDataURL = () => {
  if (!cvReady) {
    console.error("❌ OpenCV not ready for exporting");
    return null;
  }

  const canvas = document.getElementById("outputCanvas");
  if (!canvas) {
    console.error("❌ outputCanvas not found");
    return null;
  }

  return canvas.toDataURL("image/png");
};
// End of imageEnhancement.js