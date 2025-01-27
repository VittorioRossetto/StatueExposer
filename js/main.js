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

var model_statue;
var model_pedestal;

var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var modelZRotationRadians = degToRad(0);
let rotationSpeed = 0.1;

var mirrorX = 1;
var mirrorY = 1;
var mirrorZ = 1;

var statueTexture;

var statueOrientation = 0; // Variable to keep track of the orientation of the statue

async function main() {
  // compiles and links the shaders, looks up attribute and uniform locations
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  // Load the model statue
  const objHref_statue = '../data/mickeyMouse/mickeyMouse.obj';
  model_statue = await loadModel(gl, objHref_statue);

  // Load the model pedestal
  const objHref_pedestal = '../data/pedestal/PedestalText.obj';
  model_pedestal = await loadModel(gl, objHref_pedestal);

  // Load the default texture for the statue
  statueTexture = createTexture(gl, '../data/mickeyMouse/marmo.jpg');

  // Load the texture for the pedestal
  const pedestalTexture = createTexture(gl, '../data/pedestal/marmo_rosa.jpg');

  // Apply the texture to the pedestal material
  model_pedestal.parts.forEach(part => {
    part.material.diffuseMap = pedestalTexture;
  });

  // Set zNear and zFar to something hopefully appropriate
  // for the size of this object.
  const zNear = 0.1;
  const zFar = 2000;

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

    // compute the world matrix
    let u_world = m4.identity();
    u_world = m4.translate(u_world_statue, ...model_statue.objOffset);
    u_world = rotateObject([0, 0, 0], u_world)
    u_world = moveObject([0, 222.5, 0], u_world);
    u_world = m4.xRotate(u_world, modelXRotationRadians);
    u_world = m4.yRotate(u_world, modelZRotationRadians);
    u_world = m4.zRotate(u_world, -modelYRotationRadians);

    // Compute the world matrix for the pedestal
    let u_world_pedestal = m4.identity();
    u_world_pedestal = m4.translate(u_world_pedestal, ...model_pedestal.objOffset);
    u_world_pedestal = rotateObject([Math.PI/2, 0, 0], u_world_pedestal);
    u_world_pedestal = m4.xRotate(u_world_pedestal, Math.PI / 2); // Rotate 90 degrees upwards
    u_world_pedestal = m4.scale(u_world_pedestal, 10, 10, 10); // Scale the pedestal to make it bigger
    //u_world_pedestal = m4.xRotate(u_world_pedestal, modelXRotationRadians);
    if(statueOrientation <= 1) {
      u_world_pedestal = m4.zRotate(u_world_pedestal, -modelYRotationRadians);
      u_world_pedestal = m4.zRotate(u_world_pedestal, -modelZRotationRadians);
    } else {
      u_world_pedestal = m4.zRotate(u_world_pedestal, modelYRotationRadians);
      u_world_pedestal = m4.zRotate(u_world_pedestal, modelZRotationRadians);
    }
    

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
      z: u_world[14]
    };

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

    // Bind the statue texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, statueTexture);
    gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, 'diffuseMap'), 0);

    renderGenericModel(u_world, model_statue, meshProgramInfo);

    // Render the pedestal
    renderGenericModel(u_world_pedestal, model_pedestal, meshProgramInfo);

    requestAnimationFrame(render);
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

  const parts = obj.geometries.map(({ material, data }) => {
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

  return { parts, objOffset, extents };
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
          originalPositionData: data.position, // Keep a copy of the original position data
        };
      });

      const extents = getGeometriesExtents(obj.geometries);
      const range = m4.subtractVectors(extents.max, extents.min);
      const objOffset = m4.scaleVector(
        m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
        -1
      );

      // Calculate the height of the uploaded model
      const modelHeight = extents.max[1] - extents.min[1];

      // Set the target height to 455 units
      const targetHeight = 455;

      console.log('Model height:', modelHeight); // Debug logging
      console.log('Target height:', targetHeight); // Debug logging

      // Calculate the scaling factor to match the target height
      const scaleFactor = targetHeight / modelHeight;

      console.log('Scaling factor:', scaleFactor); // Debug log

      // Apply the scaling factor to the model parts
      parts.forEach(part => {
        const positionData = part.originalPositionData.slice(); // Create a copy of the original position data
        for (let i = 0; i < positionData.length; i += 3) {
          positionData[i] *= scaleFactor;     // Scale x-coordinate
          positionData[i + 1] *= scaleFactor; // Scale y-coordinate
          positionData[i + 2] *= scaleFactor; // Scale z-coordinate
        }

        // Update the buffer with the scaled data
        gl.bindBuffer(gl.ARRAY_BUFFER, part.bufferInfo.attribs.a_position.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
        // console.log('Updated position buffer:', positionData); // Debug log
      });

      resolve({ parts, objOffset, extents });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

main();