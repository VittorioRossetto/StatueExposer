"use strict"; // Enforce stricter parsing and error handling in the code

// Initialize the camera position matrix as an identity matrix
var cameraPositionMain = m4.identity();
// Translate the camera to position it at (0, 70, 700) in 3D space
cameraPositionMain = m4.translate(cameraPositionMain, 0, 70, 700);

// Variables to hold the view and projection matrices
let viewMatrixMain;
let projection;

// Speed at which the camera moves
let cameraSpeed = 5;

// Light direction vector for front lighting
let frontLightX = 1;
let frontLightY = 1;
let frontLightZ = -1;

// Initialize the world matrix for the statue as an identity matrix
var u_world_statue = m4.identity();

// Variables to hold the 3D models for the statue and pedestal
var model_statue;
var model_pedestal;

// Variables to control the rotation of the model around the X, Y, and Z axes
var modelXRotationRadians = degToRad(0); // Convert degrees to radians for rotation
var modelYRotationRadians = degToRad(0);
var modelZRotationRadians = degToRad(0);
let rotationSpeed = 0.1; // Speed of rotation

// Variables to control mirroring (scaling) along the X, Y, and Z axes
var mirrorX = 1;
var mirrorY = 1;
var mirrorZ = 1;

// Texture for the statue
var statueTexture;

// Variable to track the orientation of the statue (0 or 1 for different orientations)
var statueOrientation = 0;

// Field of view in radians
var fieldOfViewRadians = degToRad(60);

// Main function to initialize and render the scene
async function main() {
  // Compile and link the shaders, and look up attribute and uniform locations
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  // Load the 3D model for the statue
  const objHref_statue = '../data/mickeyMouse/mickeyMouse.obj';
  model_statue = await loadModel(gl, objHref_statue);

  // Load the 3D model for the pedestal
  const objHref_pedestal = '../data/pedestal/pedestalText.obj';
  model_pedestal = await loadModel(gl, objHref_pedestal);

  // Load the default texture for the statue
  statueTexture = createTexture(gl, '../data/mickeyMouse/marmo.jpg');

  // Load the texture for the pedestal
  const pedestalTexture = createTexture(gl, '../data/pedestal/marmo_rosa.jpg');

  // Apply the texture to the pedestal material
  model_pedestal.parts.forEach(part => {
    part.material.diffuseMap = pedestalTexture;
  });

  // Set the near and far clipping planes for the perspective projection
  const zNear = 0.1;
  const zFar = 2000;

  // Variable to keep track of the previous frame's time
  var then = 0;

  // Set the clear color to gray
  gl.clearColor(0.3, 0.3, 0.3, 1.0);

  // Function to render the scene repeatedly
  function render(time) {
    time *= 0.001;  // Convert time to seconds

    // Update the previous time for the next frame
    then = time;

    // Resize the canvas to match the display size and set the viewport
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing for 3D rendering

    // Calculate the perspective projection matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight; // Aspect ratio
    projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the world matrix for the statue
    let u_world = m4.identity();
    u_world = m4.translate(u_world_statue, ...model_statue.objOffset); // Translate to the statue's position
    u_world = rotateObject([0, 0, 0], u_world); // Apply rotation
    u_world = moveObject([0, 222.5, 0], u_world); // Move the statue to its final position
    u_world = m4.xRotate(u_world, modelXRotationRadians); // Rotate around the X-axis
    u_world = m4.yRotate(u_world, modelZRotationRadians); // Rotate around the Y-axis
    u_world = m4.zRotate(u_world, -modelYRotationRadians); // Rotate around the Z-axis

    // Compute the world matrix for the pedestal
    let u_world_pedestal = m4.identity();
    u_world_pedestal = m4.translate(u_world_pedestal, ...model_pedestal.objOffset); // Translate to the pedestal's position
    u_world_pedestal = rotateObject([Math.PI/2, 0, 0], u_world_pedestal); // Apply rotation
    u_world_pedestal = m4.xRotate(u_world_pedestal, Math.PI / 2); // Rotate 90 degrees upwards
    u_world_pedestal = m4.scale(u_world_pedestal, 10, 10, 10); // Scale the pedestal to make it larger

    // Select direction of pedestal depending on statue orientation, to avoid opposite rotation when statue is upside down
    if(statueOrientation <= 1) {
      u_world_pedestal = m4.zRotate(u_world_pedestal, -modelYRotationRadians); 
      u_world_pedestal = m4.zRotate(u_world_pedestal, -modelZRotationRadians);
    } else {
      u_world_pedestal = m4.zRotate(u_world_pedestal, modelYRotationRadians);
      u_world_pedestal = m4.zRotate(u_world_pedestal, modelZRotationRadians);
    }

    // Compute the view matrix by inverting the camera position matrix
    viewMatrixMain = m4.inverse(cameraPositionMain);

    // Define shared uniforms for the shaders
    var sharedUniforms = {
      u_lightDirection: m4.normalize([frontLightX, frontLightY, frontLightZ]), // Normalized light direction
      u_view: viewMatrixMain, // View matrix
      u_viewWorldPosition: [0.0, -1.0, 6.0], // Camera position in world space
      u_projection: projection, // Projection matrix
      diffuse: [1.0, 1.0, 1.0], // Diffuse color
      ambient: [1.0, 1.0, 1.0], // Ambient color
      emissive: [1.0, 1.0, 1.0], // Emissive color
      specular: [1.0, 1.0, 1.0], // Specular color
      u_ambientLight: [0.03, 0.03, 0.03], // Ambient light intensity
    };

    // Use the shader program
    gl.useProgram(meshProgramInfo.program);

    // Set the shadow uniform (not used in this example)
    gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, 'u_shadow'), shadow ? 1 : 0);

    // Set the color uniform for the shader
    const colorLocation = gl.getUniformLocation(meshProgramInfo.program, "u_color");
    gl.uniform4fv(colorLocation, [1, 1, 1, 1]); // Example color (white)

    // Set the reverse light direction uniform
    const reverseLightDirectionLocation = gl.getUniformLocation(meshProgramInfo.program, "u_reverseLightDirection");
    gl.uniform3fv(reverseLightDirectionLocation, [0.5, 0.7, 1]);

    // Set the shared uniforms for the shader
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    // Bind the statue texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, statueTexture);
    gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, 'diffuseMap'), 0);

    // Render the statue model
    renderGenericModel(u_world, model_statue, meshProgramInfo);

    // Render the pedestal model
    renderGenericModel(u_world_pedestal, model_pedestal, meshProgramInfo);

    // Request the next frame to continue the animation loop
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render); // Start the rendering loop
}

// Function to render a generic 3D model
function renderGenericModel(u_world, model, meshProgramInfo) {
  for (const { bufferInfo, material } of model.parts) {
    // Set up the buffers and attributes for the model
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    // Set the uniforms for the shader
    webglUtils.setUniforms(meshProgramInfo, {
      u_world, // World matrix
      u_diffuse: material.diffuse || [1, 1, 1, 1], // Diffuse color
      u_specular: material.specular || [1, 1, 1, 1], // Specular color
      u_emissive: material.emissive || [0, 0, 0, 1], // Emissive color
      u_shininess: material.shininess || 50, // Shininess factor
    }, material);
    // Draw the model
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

// Function to load a 3D model from an OBJ file
async function loadModel(gl, objHref) {
  const response = await fetch(objHref); // Fetch the OBJ file
  const text = await response.text(); // Read the file as text
  const obj = parseOBJ(text); // Parse the OBJ file
  const baseHref = new URL(objHref, window.location.href); // Get the base URL for relative paths

  // Load all material files referenced in the OBJ file
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href; // Get the full path to the material file
    const response = await fetch(matHref); // Fetch the material file
    return await response.text(); // Read the material file as text
  }));

  // Parse the material files
  const materials = parseMTL(matTexts.join('\n'));

  // Load textures for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith('Map')) // Find texture maps (e.g., diffuseMap)
      .forEach(([key, filename]) => {
        let texture = textures[filename]; // Check if the texture is already loaded
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href; // Get the full path to the texture
          texture = createTexture(gl, textureHref); // Create the texture
          textures[filename] = texture; // Store the texture for reuse
        }
        material[key] = texture; // Assign the texture to the material
      });
  }

  // Process the geometries in the OBJ file
  const parts = obj.geometries.map(({ material, data }) => {
    // Ensure the geometry has color data
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color }; // Set color data
      }
    } else {
      data.color = { value: [1, 1, 1, 1] }; // Default to white if no color data
    }

    // Generate tangents if texture coordinates and normals are available
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] }; // Default tangent
    }

    // Ensure texture coordinates are available
    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] }; // Default texture coordinates
    }

    // Ensure normals are available
    if (!data.normal) {
      data.normal = { value: [0, 0, 1] }; // Default normal
    }

    // Create buffer info for the geometry
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial, // Apply default material properties
        ...materials[material], // Apply material properties from the MTL file
      },
      bufferInfo, // Store the buffer info
    };
  });

  // Calculate the extents (bounding box) of the model
  const extents = getGeometriesExtents(obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min); // Calculate the size of the model
  const objOffset = m4.scaleVector(
    m4.addVectors(
      extents.min,
      m4.scaleVector(range, 0.5)),
    -1); // Calculate the offset to center the model

  return { parts, objOffset, extents }; // Return the model data
}

// Function to load a 3D model from a file (e.g., user upload)
async function loadModelFromFile(gl, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // Create a file reader
    reader.onload = async (event) => {
      const text = event.target.result; // Read the file as text
      const obj = parseOBJ(text); // Parse the OBJ file

      // Create a new material with default values
      const newMaterial = {
        diffuse: [1, 1, 1], // Diffuse color
        ambient: [0.1, 0.1, 0.1], // Ambient color
        emissive: [0, 0, 0], // Emissive color
        specular: [1, 1, 1], // Specular color
        shininess: 50, // Shininess factor
        opacity: 1, // Opacity
        diffuseMap: null, // Texture map (to be loaded)
      };

      // Load the texture for the material
      const texture = createTexture(gl, '../data/mickeyMouse/marmo.jpg');
      newMaterial.diffuseMap = texture; // Assign the texture

      // Process the geometries in the OBJ file
      const parts = obj.geometries.map(({ data }) => {
        if (!data.color) {
          data.color = { value: [1, 1, 1, 1] }; // Default to white if no color data
        }
        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data); // Create buffer info
        const material = {
          ...defaultMaterial, // Apply default material properties
          ...newMaterial, // Apply the new material
        };
        return {
          material,
          bufferInfo,
          originalPositionData: data.position, // Store the original position data
        };
      });

      // Calculate the extents (bounding box) of the model
      const extents = getGeometriesExtents(obj.geometries);
      const range = m4.subtractVectors(extents.max, extents.min); // Calculate the size of the model
      const objOffset = m4.scaleVector(
        m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
        -1
      );

      // Calculate the height of the uploaded model
      const modelHeight = extents.max[1] - extents.min[1];

      // Set the target height for scaling
      const targetHeight = 455;

      // Calculate the scaling factor to match the target height
      const scaleFactor = targetHeight / modelHeight;

      // Apply the scaling factor to the model parts
      parts.forEach(part => {
        const positionData = part.originalPositionData.slice(); // Create a copy of the position data
        for (let i = 0; i < positionData.length; i += 3) {
          positionData[i] *= scaleFactor; // Scale x-coordinate
          positionData[i + 1] *= scaleFactor; // Scale y-coordinate
          positionData[i + 2] *= scaleFactor; // Scale z-coordinate
        }

        // Update the buffer with the scaled data
        gl.bindBuffer(gl.ARRAY_BUFFER, part.bufferInfo.attribs.a_position.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
      });

      resolve({ parts, objOffset, extents }); // Return the scaled model data
    };
    reader.onerror = (err) => reject(err); // Handle file reading errors
    reader.readAsText(file); // Read the file as text
  });
}

// Start the main function
main();