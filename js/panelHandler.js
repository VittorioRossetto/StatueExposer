document.getElementById('togglePanelButton').addEventListener('click', () => {
    const panel = document.getElementById('panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
});

// Get the input elements for camera control
const fovInput = document.getElementById('fov');
const cameraXInput = document.getElementById('cameraX');
const cameraYInput = document.getElementById('cameraY');
const cameraZInput = document.getElementById('cameraZ');
var lastX = cameraXInput.value;
var lastY = cameraYInput.value;
var lastZ = cameraZInput.value;
var shadow = true;

// Event listeners to update camera parameters and call updateCamera
fovInput.addEventListener('input', () => {
    const fovValue = parseFloat(fovInput.value);
    if (fovValue >= 30 && fovValue <= 90) {
        fieldOfViewRadians = degToRad(fovValue);
    } else {
        console.warn('FOV value out of range:', fovValue);
    }
});

cameraXInput.addEventListener('input', () => {
    const newX = parseFloat(cameraXInput.value);
    m4.translate(cameraPositionMain, (newX - lastX) * cameraSpeed, 0, 0, cameraPositionMain);
    lastX = newX;
    console.log('Camera X position updated:', cameraPositionMain);
});

cameraYInput.addEventListener('input', () => {
    const newY = parseFloat(cameraYInput.value);
    m4.translate(cameraPositionMain, 0, (newY - lastY) * cameraSpeed, 0, cameraPositionMain);
    lastY = newY;
    console.log('Camera Y position updated:', cameraPositionMain);
});

cameraZInput.addEventListener('input', () => {
    const newZ = parseFloat(cameraZInput.value);
    m4.translate(cameraPositionMain, 0, 0, (newZ - lastZ) * cameraSpeed, cameraPositionMain);
    lastZ = newZ;
    console.log('Camera Z position updated:', cameraPositionMain);
});

document.getElementById('resetViewButton').addEventListener('click', () => {
    // Reset camera position and FOV to default values
    cameraPositionMain = m4.identity();
    cameraPositionMain = m4.translate(cameraPositionMain, 0, 70, 700);
    fieldOfViewRadians = degToRad(30); // Default FOV

    // Update the input fields to reflect the default values
    cameraXInput.value = cameraPositionMain[0];
    cameraYInput.value = cameraPositionMain[1];
    cameraZInput.value = cameraPositionMain[2];
    fovInput.value = 60; // Default FOV in degrees
});

document.getElementById('resetPositionButton').addEventListener('click', () => {
    modelXRotationRadians = degToRad(0);
    modelYRotationRadians = degToRad(0);
    modelZRotationRadians = degToRad(0);
    statueOrientation = 0;
})

document.getElementById('ShadowButton').addEventListener('click', () => {
    // Toggle the shadow effect
    shadow = !shadow;

    // Update the button text
    const shadowButton = document.getElementById('ShadowButton');
    shadowButton.textContent = shadow ? 'Disable Shininess' : 'Enable Shininess';
});

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const feedback = document.getElementById('feedback');
    const file = event.target.files[0];
    if (file && file.name.endsWith('.obj')) {
      feedback.textContent = "Loading...";
      try {
        const userModel = await loadModelFromFile(gl, file);
        model_statue = userModel;
        feedback.textContent = "Model loaded successfully!";
      } catch (err) {
        feedback.textContent = "Error loading model. Please try again.";
        console.error(err);
      }
    } else {
      feedback.textContent = "Invalid file type. Please upload a .obj file.";
    }
  });
  
  document.getElementById('textureInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.onload = () => {
          console.log('Texture loaded:', image);
          statueTexture = createTexture(gl, image);
  
          // Create a new material with the uploaded texture
          const newMaterial = {
            diffuse: [1, 1, 1],
            ambient: [0.1, 0.1, 0.1],
            emissive: [0, 0, 0],
            specular: [1, 1, 1],
            shininess: 50,
            opacity: 1,
            diffuseMap: statueTexture,
          };
  
          // Apply the new material to the model parts
          model_statue.parts.forEach(part => {
            part.material = {
              ...defaultMaterial,
              ...newMaterial,
            };
          });
        };
        image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  document.getElementById('rotateX').addEventListener('click', () => {
    // Reset rotations
    modelYRotationRadians = degToRad(0);
    modelZRotationRadians = degToRad(0);
  
    // Apply new rotation
    modelXRotationRadians += Math.PI / 2;
    if(statueOrientation < 3) statueOrientation += 1;
    else statueOrientation = 0;
    console.log(statueOrientation)
  });
  
  document.getElementById('rotateY').addEventListener('click', () => {
    // Apply new rotation
    modelYRotationRadians += Math.PI / 2;
  });