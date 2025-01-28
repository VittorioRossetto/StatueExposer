function parseOBJ(text) {
  // Initialize arrays to store vertex data. The 0th element serves as a placeholder since OBJ indices are 1-based.
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  const objColors = [[0, 0, 0]];

  // Organize the vertex data in the same order as they appear in 'f' (face) indices in the OBJ file.
  const objVertexData = [
      objPositions,
      objTexcoords,
      objNormals,
      objColors,
  ];

  // Create arrays for WebGL vertex data, corresponding to positions, texcoords, normals, and colors.
  let webglVertexData = [
      [],   // positions
      [],   // texcoords
      [],   // normals
      [],   // colors
  ];

  const materialLibs = []; // Stores referenced material libraries (e.g., .mtl files).
  const geometries = [];   // Stores geometry data parsed from the OBJ file.
  let geometry;            // Current geometry being processed.
  let groups = ['default']; // Current group(s) the geometry belongs to.
  let material = 'default'; // Default material name.
  let object = 'default';   // Default object name.

  const noop = () => {}; // A no-operation function for unneeded keywords.

  // Starts a new geometry object if there is existing data in the current one.
  function newGeometry() {
      if (geometry && geometry.data.position.length) {
          geometry = undefined;
      }
  }

  // Sets up a new geometry object if none exists.
  function setGeometry() {
      if (!geometry) {
          const position = [];
          const texcoord = [];
          const normal = [];
          const color = [];
          webglVertexData = [
              position,
              texcoord,
              normal,
              color,
          ];
          geometry = {
              object,
              groups,
              material,
              data: {
                  position,
                  texcoord,
                  normal,
                  color,
              },
          };
          geometries.push(geometry); // Add the new geometry to the geometries list.
      }
  }

  // Processes a single vertex in a face definition and adds its data to the WebGL arrays.
  function addVertex(vert) {
      const ptn = vert.split('/');
      ptn.forEach((objIndexStr, i) => {
          if (!objIndexStr) return; // Skip if index is not defined.
          const objIndex = parseInt(objIndexStr);
          const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
          webglVertexData[i].push(...objVertexData[i][index]); // Add vertex data.

          // If processing positions and vertex colors exist, copy the colors as well.
          if (i === 0 && objColors.length > 1) {
              geometry.data.color.push(...objColors[index]);
          }
      });
  }

  // Define handlers for various OBJ file keywords.
  const keywords = {
      v(parts) {
          // Handles vertex data. If there are extra parts, treat them as vertex colors.
          if (parts.length > 3) {
              objPositions.push(parts.slice(0, 3).map(parseFloat));
              objColors.push(parts.slice(3).map(parseFloat));
          } else {
              objPositions.push(parts.map(parseFloat));
          }
      },
      vn(parts) {
          // Handles vertex normals.
          objNormals.push(parts.map(parseFloat));
      },
      vt(parts) {
          // Handles texture coordinates.
          objTexcoords.push(parts.map(parseFloat));
      },
      f(parts) {
          // Handles face definitions, converting polygons into triangles.
          setGeometry(); // Ensure a geometry is active.
          const numTriangles = parts.length - 2;
          for (let tri = 0; tri < numTriangles; ++tri) {
              addVertex(parts[0]);        // First vertex of the triangle.
              addVertex(parts[tri + 1]); // Second vertex of the triangle.
              addVertex(parts[tri + 2]); // Third vertex of the triangle.
          }
      },
      s: noop, // Handles smoothing groups (not used here).
      mtllib(parts, unparsedArgs) {
          // Stores material library filenames.
          materialLibs.push(unparsedArgs);
      },
      usemtl(parts, unparsedArgs) {
          // Switches to a new material.
          material = unparsedArgs;
          newGeometry();
      },
      g(parts) {
          // Starts a new group.
          groups = parts;
          newGeometry();
      },
      o(parts, unparsedArgs) {
          // Starts a new object.
          object = unparsedArgs;
          newGeometry();
      },
  };

  const keywordRE = /(\w*)(?: )*(.*)/; // Regular expression to parse OBJ lines.
  const lines = text.split('\n');     // Split the file into lines.
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) continue; // Skip empty lines or comments.
      const m = keywordRE.exec(line);
      if (!m) continue;
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) continue; // Skip unsupported keywords.
      handler(parts, unparsedArgs); // Call the keyword handler.
  }

  // Remove any empty arrays from the geometry data.
  for (const geometry of geometries) {
      geometry.data = Object.fromEntries(
          Object.entries(geometry.data).filter(([, array]) => array.length > 0)
      );
  }

  return {
      geometries,    // Parsed geometries from the OBJ file.
      materialLibs,  // Referenced material libraries.
  };
}

// Function to parse texture map arguments (stub for future expansion).
function parseMapArgs(unparsedArgs) {
  // TODO: Handle options in map arguments.
  return unparsedArgs;
}

// Parses MTL (material) files and extracts material properties.
function parseMTL(text) {
  const materials = {};
  let material;

  const keywords = {
      newmtl(parts, unparsedArgs) {
          material = {};
          materials[unparsedArgs] = material;
      },
      Ns(parts)       { material.shininess = parseFloat(parts[0]); },
      Ka(parts)       { material.ambient = parts.map(parseFloat); },
      Kd(parts)       { material.diffuse = parts.map(parseFloat); },
      Ks(parts)       { material.specular = parts.map(parseFloat); },
      Ke(parts)       { material.emissive = parts.map(parseFloat); },
      map_Kd(parts, unparsedArgs) { material.diffuseMap = parseMapArgs(unparsedArgs); },
      map_Ns(parts, unparsedArgs) { material.specularMap = parseMapArgs(unparsedArgs); },
      map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
      Ni(parts)       { material.opticalDensity = parseFloat(parts[0]); },
      d(parts)        { material.opacity = parseFloat(parts[0]); },
      illum(parts)    { material.illum = parseInt(parts[0]); },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) continue;
      const m = keywordRE.exec(line);
      if (!m) continue;
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) continue;
      handler(parts, unparsedArgs);
  }

  return materials;
}

// Utility function to check if a value is a power of 2.
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// Creates a single-pixel texture with a specified RGBA color.
function create1PixelTexture(gl, pixel) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pixel));
  return texture;
}

// Creates a texture from an image source or URL.
function createTexture(gl, source) {
  const texture = create1PixelTexture(gl, [128, 192, 255, 255]); // Placeholder texture.

  if (typeof source === 'string') {
      const image = new Image();
      image.src = source;
      image.addEventListener('load', function () {
          updateTexture(gl, texture, image);
      });
  } else if (source instanceof HTMLImageElement) {
      updateTexture(gl, texture, source);
  }

  return texture;
}

// Updates a texture with image data and adjusts WebGL parameters.
function updateTexture(gl, texture, image) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip the image vertically for WebGL.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // Check if the dimensions of the image are powers of 2.
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D); // Generate mipmaps for better scaling.
  } else {
      // Set texture wrapping and filtering options for non-power-of-2 textures.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}

// Placeholder for obtaining a WebGL rendering context.
const gl = getGlContext();

// Create default textures and materials for fallback rendering.
const textures = {
  defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
};

const defaultMaterial = {
  diffuse: [1, 1, 1], // Default white diffuse color.
  diffuseMap: textures.defaultWhite, // Default texture (solid white).
  ambient: [0, 0, 0], // Default ambient color (black).
  specular: [1, 1, 1], // Default specular color (white).
  shininess: 400, // Default shininess value.
  opacity: 1, // Fully opaque by default.
};
