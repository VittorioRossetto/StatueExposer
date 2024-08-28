"use strict";

var mesh = new Array();
var positions = [];
var normals = [];
var texcoords = [];
var numVertices;
var ambient;   //Ka
var diffuse;   //Kd
var specular;  //Ks
var emissive;  //Ke
var shininess; //Ns
var opacity;   //Ni

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Function to resize the canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    
    // Call the resize function initially
    resizeCanvas();

    document.getElementById('togglePanelButton').addEventListener('click', () => {
        const panel = document.getElementById('panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    });

    //mesh.sourceMesh='data/boeing/boeing_3.obj';
    mesh.sourceMesh='data/mickeyMouse/mickeyMouse.obj';
    
    LoadMesh(gl,mesh);
    //console.log(mesh);

    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var normalLocation = gl.getAttribLocation(program, "a_normal");
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // Create a buffer for positions
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put the positions in the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for normals
    var normalsBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER mormalsBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    // Put the normals in the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // provide texture coordinates
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // Set Texcoords
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    var ambientLight=[0.2,0.2,0.2];
    var colorLight=[1.0,1.0,1.0];

    gl.uniform3fv(gl.getUniformLocation(program, "diffuse" ), diffuse );
    gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), ambient); 
    gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular );	
    gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive );
    //gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), xxx );
    gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight" ), ambientLight );
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight );

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
    gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);
    // Bind the normal buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    // Turn on the texcord attribute
    gl.enableVertexAttribArray(texcoordLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    size = 2;          // 2 components per iteration
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    var fieldOfViewRadians = degToRad(30);
    var modelXRotationRadians = degToRad(0);
    var modelYRotationRadians = degToRad(0);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    //  zmin=0.125;
    var zmin=0.1;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200);

    // Get the input elements for camera control
    const fovInput = document.getElementById('fov');
    const cameraXInput = document.getElementById('cameraX');
    const cameraYInput = document.getElementById('cameraY');
    const cameraZInput = document.getElementById('cameraZ');

    var cameraPosition = [0, -1, 5];
    var up = [0, 0, 1];
    var target = [0, 0, 0];

    // Add event listeners to the input elements
    fovInput.addEventListener('input', updateCamera);
    cameraXInput.addEventListener('input', updateCamera);
    cameraYInput.addEventListener('input', updateCamera);
    cameraZInput.addEventListener('input', updateCamera);


    var viewMatrix = m4.lookAt(cameraPosition, target, up);

    function updateCamera() {
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        gl.uniform3fv(viewWorldPositionLocation, cameraPosition);
    }
    
    // Event listeners to update camera parameters and call updateCamera
    fovInput.addEventListener('input', () => {
        fieldOfViewRadians = degToRad(fovInput.value);
        drawScene();
    });
    
    cameraXInput.addEventListener('input', () => {
        cameraPosition[0] = parseFloat(cameraXInput.value);
        updateCamera();
        drawScene();
    });
    
    cameraYInput.addEventListener('input', () => {
        cameraPosition[1] = parseFloat(cameraYInput.value);
        updateCamera();
        drawScene();
    });
    
    cameraZInput.addEventListener('input', () => {
        cameraPosition[2] = parseFloat(cameraZInput.value);
        updateCamera();
        drawScene();
    });

    document.getElementById('resetViewButton').addEventListener('click', () => {
        // Reset camera position and FOV to default values
        cameraPosition = [0, -1, 5]; // Default camera position
        fieldOfViewRadians = degToRad(30); // Default FOV
    
        // Update the input fields to reflect the default values
        cameraXInput.value = cameraPosition[0];
        cameraYInput.value = cameraPosition[1];
        cameraZInput.value = cameraPosition[2];
        fovInput.value = 60; // Default FOV in degrees
    
        // Update the camera and redraw the scene
        updateCamera();
        drawScene();
    });
    
    // Initial camera setup
    updateCamera();

    var matrixLocation = gl.getUniformLocation(program, "u_world");
    var textureLocation = gl.getUniformLocation(program, "diffuseMap");
    var viewMatrixLocation = gl.getUniformLocation(program, "u_view");
    var projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    var lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

    //gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
            
    // set the light position
    gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));

    // set the camera/view position
    //gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

    // Tell the shader to use texture unit 0 for diffuseMap
    gl.uniform1i(textureLocation, 0);

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    // Get the starting time.
    let isAnimating = true;
    let then = 0;

    // Variables for mouse/touch interaction
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationSpeed = 0.05;

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
    
            if (deltaX > 0) {
                modelYRotationRadians += rotationSpeed;
            } else if (deltaX < 0) { 
                modelYRotationRadians -= rotationSpeed;
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
    
            if (deltaX > 0) {
                modelYRotationRadians += rotationSpeed;
            } else if (deltaX < 0) {
                modelYRotationRadians -= rotationSpeed;
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

    // Start the animation
    requestAnimationFrame(drawScene);

    updateCamera();

    // Draw the scene.
    function drawScene(time) {
        if (!isAnimating) return;

        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var matrix = m4.identity();
        matrix = m4.xRotate(matrix, modelXRotationRadians);
        matrix = m4.yRotate(matrix, modelYRotationRadians);

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);

        requestAnimationFrame(drawScene);
    }

    // Event listener for spacebar press
    window.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            //Log current camera position
            console.log("Camera Position: " + cameraPosition);
            /*
            isAnimating = !isAnimating;
            if (isAnimating) {
                then = performance.now() * 0.001; // Reset the time
                requestAnimationFrame(drawScene);
            }*/
        }
    });
}

main();