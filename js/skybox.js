"use strict";

/*
  This Skybox script was created by modifying code from WebGL Fundamentals. The original code can be found at: https://webglfundamentals.org/webgl/lessons/webgl-skybox.html
*/

function main() {
  var gl = getGlContext();

  // Initialize GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);

  // Locate where vertex data is required.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Locate uniforms
  var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
  var viewDirectionProjectionInverseLocation =
      gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");

  // Create a buffer for position data
  var positionBuffer = gl.createBuffer();
  // Bind the buffer to ARRAY_BUFFER (similar to ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Load positions into the buffer
  setGeometry(gl);

  // Create a texture
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: '../data/skybox/px.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: '../data/skybox/nx.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: '../data/skybox/py.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: '../data/skybox/ny.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: '../data/skybox/pz.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: '../data/skybox/nz.jpg',
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;

    // Upload the canvas to the respective cubemap face
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // Configure each face to be immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Load an image asynchronously
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Copy the loaded image to the texture
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  // Capture the initial time
  var then = 0;

  requestAnimationFrame(drawScene);

  // Render the scene
  function drawScene(time) {
    // Convert time to seconds
    time *= 0.001;
    // Compute the time difference from the last frame
    var deltaTime = time - then;
    // Store the current time for the next frame
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Specify how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the program (pair of shaders)
    gl.useProgram(program);

    // Enable the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Specify how to pull data out of the positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // data is 32bit floats
    var normalize = false; // do not normalize the data
    var stride = 0;        // move forward size * sizeof(type) each iteration
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Set the camera position to circle 2 units from origin, looking at the origin
    var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
    //var cameraPosition = [0, -1, 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using lookAt
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Derive a view matrix from the camera matrix
    var viewMatrix = m4.inverse(cameraMatrix);

    // Remove the translation component from the view matrix as we only care about direction
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    var viewDirectionProjectionMatrix =
        m4.multiply(projectionMatrix, viewMatrix);
    var viewDirectionProjectionInverseMatrix =
        m4.inverse(viewDirectionProjectionMatrix);

    // Set the uniform variables
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        viewDirectionProjectionInverseMatrix);

    // Instruct the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // Allow the quad to pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Render the geometry
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with values defining a quad
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

/*
* DEPRECATED FUNCTION FOR LOADING CUBEMAP TEXTURES

function loadCubeMap(gl, urls) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faceInfos = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: urls.px },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: urls.nx },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: urls.py },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: urls.ny },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: urls.pz },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: urls.nz },
  ];

  faceInfos.forEach((faceInfo) => {
    const { target, url } = faceInfo;
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // Setup each face so it's immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Now that the image has loaded, copy it to the texture
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  return texture;
}
*/

main();