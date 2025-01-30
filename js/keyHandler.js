/*
* Key handler
*/

// Initialize an object to keep track of the pressed state of various keys
var keys = [];
// Initialize a flag to track whether the user is dragging the mouse/touch
let isDragging = false;

// Function to handle keydown events
function handleKeyDown(event) {
    console.log(event.key); // Log the key pressed
    if (keys != undefined) {
        console.log('keys is not undefined'); // Debugging log
        const key = event.key.toLowerCase(); // Get the key pressed and convert it to lowercase
        keys[key] = true; // Set the corresponding key in the keys object to true
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    }
}

// Function to handle keyup events
function handleKeyUp(event) {
    if (keys != undefined) {
        const key = event.key.toLowerCase(); // Get the key released and convert it to lowercase
        keys[key] = false; // Set the corresponding key in the keys object to false
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    }
}

// Add event listeners for keydown and keyup events on the window
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Function to update the camera position based on the keys pressed
function updateCameraPosition() {
    if (keys != undefined) {
        // Move the camera forward (negative Z direction) when 'w' is pressed
        if (keys['w']) {
            m4.translate(cameraPositionMain, 0, 0, -cameraSpeed, cameraPositionMain);
        }
        // Move the camera left (negative X direction) when 'a' is pressed
        if (keys['a']) {
            m4.translate(cameraPositionMain, -cameraSpeed, 0, 0, cameraPositionMain);
        }
        // Move the camera backward (positive Z direction) when 's' is pressed
        if (keys['s']) {
            console.log('pressed s'); // Debugging log
            m4.translate(cameraPositionMain, 0, 0, cameraSpeed, cameraPositionMain);
        }
        // Move the camera right (positive X direction) when 'd' is pressed
        if (keys['d']) {
            m4.translate(cameraPositionMain, cameraSpeed, 0, 0, cameraPositionMain);
        }
        // Move the camera up (positive Y direction) when 'ArrowUp' is pressed
        if (keys['ArrowUp']) {
            m4.translate(cameraPositionMain, 0, cameraSpeed, 0, cameraPositionMain);
        }
        // Move the camera down (negative Y direction) when 'ArrowDown' is pressed
        if (keys['ArrowDown']) {
            m4.translate(cameraPositionMain, 0, -cameraSpeed, 0, cameraPositionMain);
        }
        // Rotate the camera left (around the Y-axis) when 'ArrowLeft' is pressed
        if (keys['ArrowLeft']) {
            m4.yRotate(cameraPositionMain, degToRad(0.3), cameraPositionMain);
            m4.translate(cameraPositionMain, 0.027, 0, 0, cameraPositionMain);
        }
        // Rotate the camera right (around the Y-axis) when 'ArrowRight' is pressed
        if (keys['ArrowRight']) {
            m4.yRotate(cameraPositionMain, degToRad(-0.3), cameraPositionMain);
            m4.translate(cameraPositionMain, -0.027, 0, 0, cameraPositionMain);
        }
        // Log the current position of the camera when 'l' is pressed
        if (keys['l']) {
            console.log(cameraPositionMain[12], cameraPositionMain[13], cameraPositionMain[14]);
        }
    }
}

/*
* Mouse interaction
*/

// Event listeners for mouse interaction
canvas.addEventListener('mousedown', (event) => {
  isDragging = true; // Set the dragging flag to true
  lastX = event.clientX; // Store the initial X position of the mouse
  lastY = event.clientY; // Store the initial Y position of the mouse
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging) {
      // Calculate the change in mouse position (deltaX and deltaY)
      let deltaX = event.clientX - lastX;
      let deltaY = event.clientY - lastY;

      // Adjust the model's rotation based on the statue's orientation
      switch (statueOrientation) {
          case 0:
              if (deltaX > 0) {
                  modelZRotationRadians += rotationSpeed; // Rotate around the Z-axis
              } else if (deltaX < 0) {
                  modelZRotationRadians -= rotationSpeed;
              }
              break;
          case 1:
              if (deltaX > 0) {
                  modelYRotationRadians += rotationSpeed; // Rotate around the Y-axis
              } else if (deltaX < 0) {
                  modelYRotationRadians -= rotationSpeed;
              }
              break;
          case 2:
              if (deltaX > 0) {
                  modelZRotationRadians -= rotationSpeed; // Reverse rotation around the Z-axis
              } else if (deltaX < 0) {
                  modelZRotationRadians += rotationSpeed;
              }
              break;
          case 3:
              if (deltaX > 0) {
                  modelYRotationRadians -= rotationSpeed; // Reverse rotation around the Y-axis
              } else if (deltaX < 0) {
                  modelYRotationRadians += rotationSpeed;
              }
              break;
      }

      // Store the current mouse position for the next movement calculation
      lastX = event.clientX;
      lastY = event.clientY;
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false; // Reset the dragging flag when the mouse button is released
});

/*
* Touch interaction
* We do the same thing as mouse interaction but with touch events to make the application mobile-friendly
*/

// Event listeners for touch interaction
canvas.addEventListener('touchstart', (event) => {
  isDragging = true; // Set the dragging flag to true
  lastX = event.touches[0].clientX; // Store the initial X position of the touch
  lastY = event.touches[0].clientY; // Store the initial Y position of the touch
});

canvas.addEventListener('touchmove', (event) => {
  if (isDragging) {
      // Calculate the change in touch position (deltaX and deltaY)
      let deltaX = event.touches[0].clientX - lastX;
      let deltaY = event.touches[0].clientY - lastY;

      // Adjust the model's rotation based on the statue's orientation
      switch (statueOrientation) {
          case 0:
              if (deltaX > 0) {
                  modelZRotationRadians += rotationSpeed; // Rotate around the Z-axis
              } else if (deltaX < 0) {
                  modelZRotationRadians -= rotationSpeed;
              }
              break;
          case 1:
              if (deltaX > 0) {
                  modelYRotationRadians += rotationSpeed; // Rotate around the Y-axis
              } else if (deltaX < 0) {
                  modelYRotationRadians -= rotationSpeed;
              }
              break;
          case 2:
              if (deltaX > 0) {
                  modelZRotationRadians -= rotationSpeed; // Reverse rotation around the Z-axis
              } else if (deltaX < 0) {
                  modelZRotationRadians += rotationSpeed;
              }
              break;
          case 3:
              if (deltaX > 0) {
                  modelYRotationRadians -= rotationSpeed; // Reverse rotation around the Y-axis
              } else if (deltaX < 0) {
                  modelYRotationRadians += rotationSpeed;
              }
              break;
      }

      // Store the current touch position for the next movement calculation
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
  }
});

canvas.addEventListener('touchend', () => {
  isDragging = false; // Reset the dragging flag when the touch ends
});

/*
* Raycasting for light positioning
*/

// Function to calculate a ray from the mouse position in 3D space
function getRayFromMouse(mouseX, mouseY) {
  const rect = gl.canvas.getBoundingClientRect(); // Get the canvas's bounding rectangle
  console.log(rect.right); // Debugging log
  console.log(rect.left); // Debugging log
  const x = mouseX - rect.left; // Calculate the X position relative to the canvas
  const y = mouseY - rect.top; // Calculate the Y position relative to the canvas
  const clipSpace = [
      (x / rect.width) * 2 - 1, // Convert X to clip space
      (y / rect.height) * -2 + 1, // Convert Y to clip space
      -1, 1
  ];

  // Calculate the inverse of the projection and view matrices
  const inverseProjection = m4.inverse(projection);
  const inverseView = m4.inverse(viewMatrixMain);
  const invProjViewMatrix = m4.multiply(inverseProjection, inverseView);

  // Transform the clip space coordinates to world space
  const rayClip = m4.transformPoint(invProjViewMatrix, clipSpace);
  let rayOrigin = [invProjViewMatrix[12], invProjViewMatrix[13], invProjViewMatrix[14]]; // Extract the camera position
  let rayDirection = m4.normalize(m4.subtractVectors(rayClip, rayOrigin)); // Calculate the ray direction

  return {
      origin: rayOrigin, // The origin of the ray (camera position)
      direction: rayDirection // The direction of the ray
  };
}

// Event listener for clicking on the canvas
gl.canvas.addEventListener('click', (event) => {
  const ray = getRayFromMouse(event.clientX, event.clientY); // Get the ray from the mouse click
  frontLightX = ray.origin[0] + ray.direction[0]; // Update the light's X position
  frontLightY = ray.origin[1] + ray.direction[1]; // Update the light's Y position
  frontLightZ = ray.origin[2] + ray.direction[2]; // Update the light's Z position
});


/*
* MULTI TOUCH GESTURES
*/

let initialPinchDistance = null;
let lastTouchX = null;
let lastTouchY = null;

canvas.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
        // Store initial distance for pinch gesture
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);

        // Store initial positions for two-finger swipe
        lastTouchX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        lastTouchY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    }
});

canvas.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        // Handle pinch zoom
        if (initialPinchDistance !== null) {
            if (currentDistance > initialPinchDistance + 10) {
                // Equivalent to pressing 'w' (move forward)
                m4.translate(cameraPositionMain, 0, 0, -cameraSpeed, cameraPositionMain);
            } else if (currentDistance < initialPinchDistance - 10) {
                // Equivalent to pressing 's' (move backward)
                m4.translate(cameraPositionMain, 0, 0, cameraSpeed, cameraPositionMain);
            }
            initialPinchDistance = currentDistance; // Update distance for next move
        }

        // Handle two-finger swipe (horizontal for 'a' and 'd', vertical for ArrowUp/ArrowDown)
        const currentX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        const currentY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        const deltaX = currentX - lastTouchX;
        const deltaY = currentY - lastTouchY;

        if (Math.abs(deltaX) > 20) {
            if (deltaX > 0) {
                // Equivalent to pressing 'd' (move right)
                m4.translate(cameraPositionMain, cameraSpeed, 0, 0, cameraPositionMain);
            } else {
                // Equivalent to pressing 'a' (move left)
                m4.translate(cameraPositionMain, -cameraSpeed, 0, 0, cameraPositionMain);
            }
        }

        if (Math.abs(deltaY) > 20) {
            if (deltaY > 0) {
                // Equivalent to pressing 'ArrowDown' (move down)
                m4.translate(cameraPositionMain, 0, -cameraSpeed, 0, cameraPositionMain);
            } else {
                // Equivalent to pressing 'ArrowUp' (move up)
                m4.translate(cameraPositionMain, 0, cameraSpeed, 0, cameraPositionMain);
            }
        }

        lastTouchX = currentX;
        lastTouchY = currentY;
    }
});

canvas.addEventListener('touchend', (event) => {
    if (event.touches.length < 2) {
        // Reset values when gesture ends
        initialPinchDistance = null;
    }
});
