// Toggle panel visibility
document.getElementById('togglePanelButton').addEventListener('click', () => {
  const panel = document.getElementById('panel');
  // Check the current display style and toggle between 'none' and 'block'
  if (panel.style.display === 'none') {
      panel.style.display = 'block'; // Show the panel
  } else {
      panel.style.display = 'none'; // Hide the panel
  }
});

// Camera control input elements
const fovInput = document.getElementById('fov'); // Field of View input
const cameraXInput = document.getElementById('cameraX'); // Camera X position input
const cameraYInput = document.getElementById('cameraY'); // Camera Y position input
const cameraZInput = document.getElementById('cameraZ'); // Camera Z position input

// Set initial values for lastX, lastY, and lastZ to match the initial camera position
var lastX = 0;
var lastY = 0;
var lastZ = 0;

var shadow = true; // Tracks the state of shadow (enabled/disabled)

// Handle FOV changes
fovInput.addEventListener('input', () => {
  const fovValue = parseFloat(fovInput.value);
  // Validate FOV is within the acceptable range (30 to 90 degrees)
  if (fovValue >= 30 && fovValue <= 90) {
      fieldOfViewRadians = degToRad(fovValue); // Convert to radians
  } else {
      console.warn('FOV value out of range:', fovValue); // Log a warning for invalid values
  }
});

// Update camera X position and recalculate
cameraXInput.addEventListener('input', () => {
  const newX = parseFloat(cameraXInput.value); // Get the new X position
  // Translate camera position based on the change from the last X value
  m4.translate(cameraPositionMain, (newX - lastX) * cameraSpeed, 0, 0, cameraPositionMain);
  lastX = newX; // Update the last X value
  // console.log('Camera X position updated:', cameraPositionMain);
});

// Update camera Y position and recalculate
cameraYInput.addEventListener('input', () => {
  const newY = parseFloat(cameraYInput.value); // Get the new Y position
  // Translate camera position based on the change from the last Y value
  m4.translate(cameraPositionMain, 0, (newY - lastY) * cameraSpeed, 0, cameraPositionMain);
  lastY = newY; // Update the last Y value
  // console.log('Camera Y position updated:', cameraPositionMain);
});

// Update camera Z position and recalculate
cameraZInput.addEventListener('input', () => {
  const newZ = parseFloat(cameraZInput.value); // Get the new Z position
  // Translate camera position based on the change from the last Z value
  m4.translate(cameraPositionMain, 0, 0, (newZ - lastZ) * cameraSpeed, cameraPositionMain);
  lastZ = newZ; // Update the last Z value
  // console.log('Camera Z position updated:', cameraPositionMain); //
});

// Reset camera position and FOV to default values
document.getElementById('resetViewButton').addEventListener('click', () => {
  cameraPositionMain = m4.identity(); // Reset camera position to identity matrix
  cameraPositionMain = m4.translate(cameraPositionMain, 0, 70, 700); // Default camera position
  fieldOfViewRadians = degToRad(60); // Default FOV in radians

  // Update input fields to reflect the default values
  cameraXInput.value = cameraPositionMain[0];
  cameraYInput.value = cameraPositionMain[1];
  cameraZInput.value = cameraPositionMain[2];
  fovInput.value = 60; // Default FOV in degrees
});

// Reset model's orientation
document.getElementById('resetPositionButton').addEventListener('click', () => {
  modelXRotationRadians = degToRad(0); // Reset X rotation
  modelYRotationRadians = degToRad(0); // Reset Y rotation
  modelZRotationRadians = degToRad(0); // Reset Z rotation
  statueOrientation = 0; // Reset statue orientation
});

// Toggle shadow effect
document.getElementById('ShadowButton').addEventListener('click', () => {
  shadow = !shadow; // Toggle shadow state

  // Update button text to reflect current state
  const shadowButton = document.getElementById('ShadowButton');
  shadowButton.textContent = shadow ? 'Disable Shininess' : 'Enable Shininess';
});

// Handle .obj model file upload
document.getElementById('fileInput').addEventListener('change', async (event) => {
  const feedback = document.getElementById('feedback'); // Feedback element
  const file = event.target.files[0]; // Get the selected file
  if (file && file.name.endsWith('.obj')) { // Ensure it's an .obj file
      feedback.textContent = "Loading...";
      try {
          const userModel = await loadModelFromFile(gl, file); // Load the 3D model
          model_statue = userModel; // Assign the loaded model
          feedback.textContent = "Model loaded successfully!";
      } catch (err) {
          feedback.textContent = "Error loading model. Please try again.";
          console.error(err); // Log errors for debugging
      }
  } else {
      feedback.textContent = "Invalid file type. Please upload a .obj file.";
  }
});

// Handle texture upload
document.getElementById('textureInput').addEventListener('change', (event) => {
  const file = event.target.files[0]; // Get the selected file
  if (file && file.type === 'image/jpeg') { // Ensure it's a JPEG image
      const reader = new FileReader();
      reader.onload = (e) => {
          const image = new Image();
          image.onload = () => {
              console.log('Texture loaded:', image); // Log the loaded texture
              statueTexture = createTexture(gl, image); // Create texture

              // Define new material properties with the uploaded texture
              const newMaterial = {
                  diffuse: [1, 1, 1],
                  ambient: [0.1, 0.1, 0.1],
                  emissive: [0, 0, 0],
                  specular: [1, 1, 1],
                  shininess: 50,
                  opacity: 1,
                  diffuseMap: statueTexture, // Assign the texture
              };

              // Apply the new material to all parts of the model
              model_statue.parts.forEach(part => {
                  part.material = {
                      ...defaultMaterial,
                      ...newMaterial, // Override default material properties
                  };
              });
          };
          image.src = e.target.result; // Set the image source to the file data
      };
      reader.readAsDataURL(file); // Read the file as a data URL
  }
});

// Rotate the model around the X axis
document.getElementById('rotateX').addEventListener('click', () => {
  modelYRotationRadians = degToRad(0); // Reset Y rotation
  modelZRotationRadians = degToRad(0); // Reset Z rotation

  // Increment X rotation by 90 degrees
  modelXRotationRadians += Math.PI / 2;

  // Update statue orientation (wraps back to 0 after 3)
  if (statueOrientation < 3) statueOrientation += 1;
  else statueOrientation = 0;

  console.log(statueOrientation); // Log the new orientation
});

// Rotate the model around the Y axis
document.getElementById('rotateY').addEventListener('click', () => {
  modelYRotationRadians += Math.PI / 2; // Increment Y rotation by 90 degrees
});
