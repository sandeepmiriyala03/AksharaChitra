// imageEnhancement.js

// Wait for OpenCV.js to be initialized
let cvReady = false;
cv.onRuntimeInitialized = () => {
  cvReady = true;
  console.log("OpenCV.js is ready!");
};

// Function to enhance image based on brightness and contrast
function enhanceImage() {
  if (!cvReady) {
    console.error("OpenCV.js is not initialized yet.");
    return;
  }

  let imgElement = document.getElementById('cropImage');
  if (!imgElement) {
    console.error("Image element not found!");
    return;
  }

  // Create OpenCV Mat object from image
  let mat = cv.imread(imgElement);
  let dst = new cv.Mat();

  // Get the slider values for brightness and contrast
  let brightness = parseInt(document.getElementById('brightness').value);
  let contrast = parseFloat(document.getElementById('contrast').value);

  // Apply brightness and contrast adjustments
  mat.convertTo(dst, -1, contrast, brightness);

  // Get the canvas element for output
  let canvas = document.getElementById('outputCanvas');
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  // Set canvas size to match the image size
  canvas.width = mat.cols;
  canvas.height = mat.rows;

  // Display the enhanced image in the canvas
  cv.imshow(canvas, dst);

  // Cleanup memory
  mat.delete();
  dst.delete();
}

// Event listeners for the sliders
document.getElementById('brightness').addEventListener('input', enhanceImage);
document.getElementById('contrast').addEventListener('input', enhanceImage);

// Expose this function globally so that main.js can access it
window.enhanceImage = enhanceImage;

// Function to get the enhanced image data URL
window.getEnhancedImageDataURL = function() {
  if (!cvReady) {
    console.error("OpenCV.js is not initialized yet.");
    return null;
  }

  let canvas = document.getElementById('outputCanvas');
  if (!canvas) {
    console.error("Canvas element not found!");
    return null;
  }

  return canvas.toDataURL('image/png');
};

/* =========================================== 🖥️ DESKTOP (LARGE VIEW) =========================================== */
@media (min-width: 992px) {
  .crop-modal-content {
    max-width: 620px;
    padding: 22px;
  }
  .crop-modal-header h3 {
    font-size: 1.75rem;
  }
  .crop-btn {
    font-size: 1.1rem;
    padding: 12px;
  }
  .crop-image-wrapper {
    padding: 30px;
  }
  .crop-close-btn {
    font-size: 1.8rem;
  }
}