// Initialize an object to keep track of the pressed state of various keys
var keys = [];
// Initialize to keep track of object dragging
let isDragging = false;

// Function to handle keydown events
function handleKeyDown(event) {
    console.log(event.key);
    if(keys != undefined) {
        console.log('keys is not undefined');
        const key = event.key.toLowerCase(); // Get the key pressed and convert it to lowercase
        keys[key] = true; // Set the corresponding key in the keys object to true
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    }
}

// Function to handle keyup events
function handleKeyUp(event) {
  if(keys != undefined) {
    const key = event.key.toLowerCase(); // Get the key released and convert it to lowercase
    keys[key] = false; // Set the corresponding key in the keys object to false
    updateCameraPosition(); // Update the camera position based on the current keys pressed
  }
}

/* Add event listeners to all elements with the class "arrow-key"
document.querySelectorAll(".arrow-key").forEach(function(button) {
    const keyCode = button.getAttribute("data-key"); // Get the key associated with the button

    // Add event listener for mousedown event
    button.addEventListener("mousedown", function(e) {
        keys[keyCode] = true; // Set the corresponding key in the keys object to true
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });

    // Add event listener for mouseup event
    button.addEventListener("mouseup", function(e) {
        keys[keyCode] = false; // Set the corresponding key in the keys object to false
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });

    // Add event listener for mouseout event
    button.addEventListener("mouseout", function(e) {
        keys[keyCode] = false; // Set the corresponding key in the keys object to false
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });
}); */

// Add event listeners for keydown and keyup events on the window
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

function updateCameraPosition() {
    if(keys != undefined){
      if (keys['w']) {
        m4.translate(cameraPositionMain, 0, 0, -cameraSpeed, cameraPositionMain);
        ////m4.translate(u_world_rocket, 0, 0, -cameraSpeed, u_world_rocket);
      }
      if (keys['a']) {
        m4.translate(cameraPositionMain, -cameraSpeed, 0, 0, cameraPositionMain);
        //m4.translate(u_world_rocket, -cameraSpeed, 0, 0, u_world_rocket);
      }
      if (keys['s']) {
        console.log('pressed s');
        m4.translate(cameraPositionMain, 0, 0, cameraSpeed, cameraPositionMain);
        //m4.translate(u_world_rocket, 0, 0, cameraSpeed, u_world_rocket);
      }
      if (keys['d']) {
        m4.translate(cameraPositionMain, cameraSpeed, 0, 0, cameraPositionMain);
        //m4.translate(u_world_rocket, cameraSpeed, 0, 0, u_world_rocket);
      }
      if (keys['ArrowUp']) {
          m4.translate(cameraPositionMain, 0, cameraSpeed, 0, cameraPositionMain);
          //m4.translate(u_world_rocket, 0, cameraSpeed, 0, u_world_rocket);
      }
      if (keys['ArrowDown']) {
          m4.translate(cameraPositionMain, 0, -cameraSpeed, 0, cameraPositionMain);
          //m4.translate(u_world_rocket, 0, -cameraSpeed, 0, u_world_rocket);
      }
      if (keys['ArrowLeft']) {
          m4.yRotate(cameraPositionMain, degToRad(0.3), cameraPositionMain);
          //m4.yRotate(u_world_rocket, degToRad(0.3), u_world_rocket);
          m4.translate(cameraPositionMain, 0.027, 0, 0, cameraPositionMain);
      }
      if (keys['ArrowRight']) {
          m4.yRotate(cameraPositionMain, degToRad(-0.3), cameraPositionMain);
          //m4.yRotate(u_world_rocket, degToRad(-0.3), u_world_rocket);
          m4.translate(cameraPositionMain, -0.027, 0, 0, cameraPositionMain);
      }
      if (keys['arrowup']) {
        m4.translate(cameraPositionMain, 0, cameraSpeed, 0, cameraPositionMain);
        //m4.translate(u_world_rocket, 0, cameraSpeed, 0, u_world_rocket);
      }
      if (keys['arrowdown']) {
        m4.translate(cameraPositionMain, 0, -cameraSpeed, 0, cameraPositionMain);
        //m4.translate(u_world_rocket, 0, -cameraSpeed, 0, u_world_rocket);
      }
      if (keys['arrowleft']) {
        m4.yRotate(cameraPositionMain, degToRad(0.3), cameraPositionMain);
        //m4.yRotate(u_world_rocket, degToRad(0.3), u_world_rocket);
        m4.translate(cameraPositionMain, 0.027, 0, 0, cameraPositionMain);
      }
      if (keys['arrowright']) {
        m4.yRotate(cameraPositionMain, degToRad(-0.3), cameraPositionMain);
        //m4.yRotate(u_world_rocket, degToRad(-0.3), u_world_rocket);
        m4.translate(cameraPositionMain, -0.027, 0, 0, cameraPositionMain);
      }
      if (keys['l']) {
        //we log the current position of the camera
        console.log(cameraPositionMain[12], cameraPositionMain[13], cameraPositionMain[14]);
      }
    }
}

// Event listeners for mouse interaction
canvas.addEventListener('mousedown', (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging) {
      let deltaX = event.clientX - lastX;
      let deltaY = event.clientY - lastY;

      switch(statueOrientation)
      {
        case 0:
          if (deltaX > 0) {
            modelZRotationRadians += rotationSpeed;
          } else if (deltaX < 0) {
            modelZRotationRadians -= rotationSpeed;
          }
          break;
        case 1:
          if (deltaX > 0) {
            modelYRotationRadians += rotationSpeed;
          } else if (deltaX < 0) {
            modelYRotationRadians -= rotationSpeed;
          }
          break;
        case 2:
          if (deltaX > 0) {
            modelZRotationRadians -= rotationSpeed;
          } else if (deltaX < 0) {
              modelZRotationRadians += rotationSpeed;
          }
          break;
        case 3:
          if (deltaX > 0) {
            modelYRotationRadians -= rotationSpeed;
          } else if (deltaX < 0) {
            modelYRotationRadians += rotationSpeed;
          }
          break;
      }

      /*if (deltaY > 0) {
          modelXRotationRadians += rotationSpeed;
      } else if (deltaY < 0) {
          modelXRotationRadians -= rotationSpeed;
      }*/

      // Update the camera view matrix to look at the target object
      //updateCamera();

      // Store the current mouse position for the next movement calculation
      lastX = event.clientX;
      lastY = event.clientY;
  }
});


canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

// Event listeners for touch interaction
canvas.addEventListener('touchstart', (event) => {
  isDragging = true;
  lastX = event.touches[0].clientX;
  lastY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
  if (isDragging) {
      let deltaX = event.touches[0].clientX - lastX;
      let deltaY = event.touches[0].clientY - lastY;
      
      switch(statueOrientation)
      {
        case 0:
          if (deltaX > 0) {
            modelZRotationRadians += rotationSpeed;
          } else if (deltaX < 0) {
            modelZRotationRadians -= rotationSpeed;
          }
        case 1:
          if (deltaX > 0) {
            modelYRotationRadians += rotationSpeed;
          } else if (deltaX < 0) {
            modelYRotationRadians -= rotationSpeed;
          }
          case 2:
          if (deltaX > 0) {
            modelZRotationRadians -= rotationSpeed;
          } else if (deltaX < 0) {
              modelZRotationRadians += rotationSpeed;
          }
        case 3:
          if (deltaX > 0) {
            modelYRotationRadians -= rotationSpeed;
          } else if (deltaX < 0) {
            modelYRotationRadians += rotationSpeed;
          }
      }
      

      /*
      if (deltaY > 0) {
          modelXRotationRadians += rotationSpeed;
      } else if (deltaY < 0) {
          modelXRotationRadians -= rotationSpeed;
      }*/

      //updateCamera();
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
  }
});

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

function getRayFromMouse(mouseX, mouseY) {
  const rect = gl.canvas.getBoundingClientRect();
  console.log(rect.right);
  console.log(rect.left);
  const x = mouseX - rect.left;
  const y = mouseY - rect.top;
  const clipSpace = [
    (x / rect.width) * 2 - 1,
    (y / rect.height) * -2 + 1,
    -1, 1
  ];

  const inverseProjection = m4.inverse(projection);
  const inverseView = m4.inverse(viewMatrixMain);
  const invProjViewMatrix = m4.multiply(inverseProjection, inverseView);

  const rayClip = m4.transformPoint(invProjViewMatrix, clipSpace);
  let rayOrigin = [invProjViewMatrix[12], invProjViewMatrix[13], invProjViewMatrix[14]];
  let rayDirection = m4.normalize(m4.subtractVectors(rayClip, rayOrigin));

  return {
    origin: rayOrigin,
    direction: rayDirection
  };
}

gl.canvas.addEventListener('click', (event) => {
  const ray = getRayFromMouse(event.clientX, event.clientY);
  frontLightX = ray.origin[0] + ray.direction[0];
  frontLightY = ray.origin[1] + ray.direction[1];
  frontLightZ = ray.origin[2] + ray.direction[2];
});

function getRayFromMouse(mouseX, mouseY) {
  const rect = gl.canvas.getBoundingClientRect();
  console.log(rect.right);
  console.log(rect.left);
  const x = mouseX - rect.left;
  const y = mouseY - rect.top;
  const clipSpace = [
    (x / rect.width) * 2 - 1,
    (y / rect.height) * -2 + 1,
    -1, 1
  ];

  const inverseProjection = m4.inverse(projection);
  const inverseView = m4.inverse(viewMatrixMain);
  const invProjViewMatrix = m4.multiply(inverseProjection, inverseView);

  const rayClip = m4.transformPoint(invProjViewMatrix, clipSpace);
  let rayOrigin = [invProjViewMatrix[12], invProjViewMatrix[13], invProjViewMatrix[14]];
  let rayDirection = m4.normalize(m4.subtractVectors(rayClip, rayOrigin));

  return {
    origin: rayOrigin,
    direction: rayDirection
  };
}

gl.canvas.addEventListener('click', (event) => {
  const ray = getRayFromMouse(event.clientX, event.clientY);
  frontLightX = ray.origin[0] + ray.direction[0];
  frontLightY = ray.origin[1] + ray.direction[1];
  frontLightZ = ray.origin[2] + ray.direction[2];
});