"use strict";

function main() {
  var gl = getGlContext();

  // Initialize GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
  var viewDirectionProjectionInverseLocation =
      gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faceInfos = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../data/skybox/px.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../data/skybox/nx.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../data/skybox/py.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../data/skybox/ny.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../data/skybox/pz.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../data/skybox/nz.jpg' },
  ];

  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
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
  var then = 0;

  // Add a flag to control the visibility of the skybox
  var skyboxVisible = true;

  document.getElementById("toggle-skybox").addEventListener("click", function() {
    skyboxVisible = !skyboxVisible;
  });

  requestAnimationFrame(drawScene);

  function drawScene(time) {
    time *= 0.001;
    var deltaTime = time - then;
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (skyboxVisible) {
      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      var size = 2;
      var type = gl.FLOAT;
      var normalize = false;
      var stride = 0;
      var offset = 0;
      gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

      var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
      var target = [0, 0, 0];
      var up = [0, 1, 0];
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);

      var viewMatrix = m4.inverse(cameraMatrix);

      viewMatrix[12] = 0;
      viewMatrix[13] = 0;
      viewMatrix[14] = 0;

      var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
      var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

      gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, viewDirectionProjectionInverseMatrix);
      gl.uniform1i(skyboxLocation, 0);

      gl.depthFunc(gl.LEQUAL);

      gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    }

    requestAnimationFrame(drawScene);
  }
}

function setGeometry(gl) {
  var positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

main();
