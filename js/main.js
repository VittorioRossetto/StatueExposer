"use strict";

var cameraPositionMain = m4.identity();
// Set the camera position to 0 0 500
cameraPositionMain = m4.translate(cameraPositionMain, 0, 70, 700);
let viewMatrixMain;
let projection;

let cameraSpeed = 5;

let frontLightX = 1;
let frontLightY = 1;
let frontLightZ = -1;

var u_world_statue = m4.identity();

var model_portrait;
var model_statue;

var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
let rotationSpeed = 0.1;

let initialMaterials; // Global variable to store the initial materials

async function main() {
    // compiles and links the shaders, looks up attribute and uniform locations
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    // Load the model statue
    const objHref_statue = '../data/mickeyMouse/mickeyMouse.obj';
    model_statue = await loadModel(gl, objHref_statue);

    // Load the model pedestal
    const objHref_pedestal = '../data/pedestal/pedestal.obj';
    var model_pedestal = await loadModel(gl, objHref_pedestal);

    const mtlHref_statue = '../data/mickeyMouse/mickeyMouse.mtl';
    const materialsText = await fetch(mtlHref_statue).then((res) => res.text());
    initialMaterials = parseMTL(materialsText);

    // Set zNear and zFar to something hopefully appropriate
    // for the size of this object.
    const zNear = 0.1;
    const zFar = 2000;

    var modelXRotationRadians2 = degToRad(0);
    var modelYRotationRadians2 = degToRad(0);

    // Get the starting time.
    var then = 0;

    // Draw the scene repeatedly
    function render(time) {
        time *= 0.001;  // convert to seconds
        // Subtract the previous time from the current time
        var deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;
    
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
    
        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    
        // Animate the rotation
        //modelYRotationRadians1 += 0.7 * deltaTime;
        //modelXRotationRadians1 += 0.4 * (1 * deltaTime);
    
        // compute the world matrix
        let u_world = m4.identity();
        u_world = m4.translate(u_world_statue, ...model_statue.objOffset);
        u_world = rotateObject([0, 0, 0], u_world)
        u_world = moveObject([0, 220, -5], u_world);
        u_world = m4.xRotate(u_world, modelXRotationRadians);
        u_world = m4.yRotate(u_world, modelYRotationRadians);

        // Compute the world matrix for the pedestal
        let u_world_pedestal = m4.identity();
        u_world_pedestal = m4.translate(u_world_pedestal, ...model_pedestal.objOffset);
        u_world_pedestal = rotateObject([Math.PI/2, 0, 0], u_world_pedestal);
        u_world_pedestal = m4.xRotate(u_world_pedestal, Math.PI / 2); // Rotate 90 degrees upwards
        u_world_pedestal = m4.scale(u_world_pedestal, 10, 10, 10); // Scale the pedestal to make it bigger
        u_world_pedestal = m4.xRotate(u_world_pedestal, modelXRotationRadians);
        u_world_pedestal = m4.zRotate(u_world_pedestal, -modelYRotationRadians);

        var sharedUniforms;
        viewMatrixMain = m4.inverse(u_world);
    
        viewMatrixMain = m4.inverse(cameraPositionMain);
    
        sharedUniforms = {
          u_lightDirection: m4.normalize([frontLightX, frontLightY, frontLightZ]), // light direction vector
          u_view: viewMatrixMain,
          u_viewWorldPosition: [0.0, -1.0, 6.0],
          u_projection: projection,
          diffuse: [1.0, 1.0, 1.0],
          ambient: [1.0, 1.0, 1.0],
          emissive: [1.0, 1.0, 1.0],
          specular: [1.0, 1.0, 1.0],
          u_ambientLight: [0.03, 0.03, 0.03],
        };
    
        // Extract statue position from u_world matrix
        let statuetPosition = {
          x: u_world[12], 
          y: u_world[13],
          z: u_world[14]};
    
        gl.useProgram(meshProgramInfo.program);
          
        // Set the shadow uniform
        gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, 'u_shadow'), shadow ? 1 : 0);

        // Set the color uniform
        const colorLocation = gl.getUniformLocation(meshProgramInfo.program, "u_color");
        gl.uniform4fv(colorLocation, [1, 1, 1, 1]); // Example color

        // Set the reverse light direction uniform
        const reverseLightDirectionLocation = gl.getUniformLocation(meshProgramInfo.program, "u_reverseLightDirection");
        gl.uniform3fv(reverseLightDirectionLocation, [0.5, 0.7, 1]);

        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
    
        renderGenericModel(u_world, model_statue, meshProgramInfo);
    
        // Render the pedestal
        renderGenericModel(u_world_pedestal, model_pedestal, meshProgramInfo);

        requestAnimationFrame(render);
        updateCameraPosition();
    }
    requestAnimationFrame(render);
}

function renderGenericModel(u_world, model, meshProgramInfo) {
  for (const { bufferInfo, material } of model.parts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, {
          u_world,
          u_diffuse: material.diffuse || [1, 1, 1, 1],
          u_specular: material.specular || [1, 1, 1, 1],
          u_emissive: material.emissive || [0, 0, 0, 1],
          u_shininess: material.shininess || 50,
      }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

async function loadModel(gl, objHref) {
    const response = await fetch(objHref);
    const text = await response.text();
    const obj = parseOBJ(text);
    const baseHref = new URL(objHref, window.location.href);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
      const matHref = new URL(filename, baseHref).href;
      const response = await fetch(matHref);
      return await response.text();
    }));
    const materials = parseMTL(matTexts.join('\n'));
  
    // load texture for materials
    for (const material of Object.values(materials)) {
      Object.entries(material)
        .filter(([key]) => key.endsWith('Map'))
        .forEach(([key, filename]) => {
          let texture = textures[filename];
          if (!texture) {
            const textureHref = new URL(filename, baseHref).href;
            texture = createTexture(gl, textureHref);
            textures[filename] = texture;
          }
          material[key] = texture;
        });
    }
  
    const parts = obj.geometries.map(({material, data}) => {
      if (data.color) {
        if (data.position.length === data.color.length) {
          data.color = { numComponents: 3, data: data.color };
        }
      } else {
        data.color = { value: [1, 1, 1, 1] };
      }
  
      if (data.texcoord && data.normal) {
        data.tangent = generateTangents(data.position, data.texcoord);
      } else {
        data.tangent = { value: [1, 0, 0] };
      }
  
      if (!data.texcoord) {
        data.texcoord = { value: [0, 0] };
      }
  
      if (!data.normal) {
        data.normal = { value: [0, 0, 1] };
      }
  
      const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
      return {
        material: {
          ...defaultMaterial,
          ...materials[material],
        },
        bufferInfo,
      };
    });  
  
    const extents = getGeometriesExtents(obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);
    const objOffset = m4.scaleVector(
        m4.addVectors(
          extents.min,
          m4.scaleVector(range, 0.5)),
        -1);
  
    return {parts, objOffset}
}

async function loadModelFromFile(gl, file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
          const text = event.target.result;
          const obj = parseOBJ(text);

          // Create a new material with default values or values extracted from the file
          const newMaterial = {
              diffuse: [1, 1, 1],
              ambient: [0.1, 0.1, 0.1],
              emissive: [0, 0, 0],
              specular: [1, 1, 1],
              shininess: 50,
              opacity: 1,
              diffuseMap: null, // Set this to the texture if available
          };

          // Load the texture using the createTexture function from textureUtils.js
          const texture = createTexture(gl, '../data/mickeyMouse/marmo.jpg');
          newMaterial.diffuseMap = texture;

          console.log('New material:', newMaterial); // Debug logging
          const parts = obj.geometries.map(({ data }) => {
              if (!data.color) {
                  data.color = { value: [1, 1, 1, 1] }; // Default to white
              }
              const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
              const material = {
                  ...defaultMaterial,
                  ...newMaterial, // Apply the new material
              };
              console.log('Applying material:', material); // Debug logging
              return {
                  material,
                  bufferInfo,
              };
          });

          const extents = getGeometriesExtents(obj.geometries);
          const range = m4.subtractVectors(extents.max, extents.min);
          const objOffset = m4.scaleVector(
              m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
              -1
          );

          resolve({ parts, objOffset });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
  });
}

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

main();