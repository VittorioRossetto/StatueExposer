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

document.getElementById('ShadowButton').addEventListener('click', () => {
    // Toggle the shadow effect
    shadow = !shadow;

    // Update the button text
    const shadowButton = document.getElementById('ShadowButton');
    shadowButton.textContent = shadow ? 'Disable Shininess' : 'Enable Shininess';
});