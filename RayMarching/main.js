var scene, camera, renderer;
var geometry, material, mesh;
var uniforms;

// setup rendering parameters for the shader
var aspect = window.innerWidth / window.innerHeight;
var zoom = 1.0;
var offset = new THREE.Vector2(-0.50*aspect, -0.5);
var cameraX = new THREE.Vector3(1.0, 0.0, 0.0);
var cameraY = new THREE.Vector3(0.0, 0.0, -1.0);
var cameraZ = new THREE.Vector3(0.0, 1.0, 0.0);
var cameraPos = new THREE.Vector3(0.0, 0.0, 1.0);


//TODO: break this up into other files
// & figure out how importing works in this language
// Main ================================================
function main()
{
  setup();

  geometry = new THREE.PlaneBufferGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader,
  });

  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  // DEBUGGING ONLY ==================
  var v = new Quaternion(1, 0, 0, 0);
  
  // ANIMATE ==================
  animate();
}


function animate()
{
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Setup ================================================
function setup()
{
  camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: false, precision:'highp' } );
  renderer.setSize( window.innerWidth, window.innerHeight-2 );
  document.body.appendChild( renderer.domElement );

  uniforms = {
      res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      aspect: {type: 'float', value: aspect},
      zoom: {type:'float', value: zoom},
      offset: {type: 'float', value: offset},
      cameraX: {type: 'vec3', value: cameraX},
      cameraY: {type: 'vec3', value: cameraY},
      cameraZ: {type: 'vec3', value: cameraZ},
      cameraPos: {type: 'vec3', value: cameraPos},
  };
}

// events ================================================
function windowResize()
{
  aspect = window.innerWidth / window.innerHeight;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight-2);
}

function handleInput(event)
{
  if (event.keyCode == 87)
  {
    // there should be a class to store the camera's position and rotation
    // which caches these values and updates them when a rotation is applied
    var cameraYDirection = cameraY.clone().multiplyScalar(0.01)
    cameraPos.add(cameraYDirection);

    // TODO: move uniform updates to another function called during animate()
    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 65)
  {
    var cameraXDirection = cameraX.clone().multiplyScalar(0.01)
    cameraPos.sub(cameraXDirection);

    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 83)
  {
    var cameraYDirection = cameraY.clone().multiplyScalar(0.01)
    cameraPos.sub(cameraYDirection);

    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 68)
  {
    var cameraXDirection = cameraX.clone().multiplyScalar(0.01)
    cameraPos.add(cameraXDirection);

    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 32)
  {
    var cameraZDirection = cameraZ.clone().multiplyScalar(0.01)
    cameraPos.add(cameraZDirection);

    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 16)
  {
    var cameraZDirection = cameraZ.clone().multiplyScalar(0.01)
    cameraPos.sub(cameraZDirection);

    uniforms['cameraPos']['value'] = cameraPos;
  }
  if (event.keyCode == 27)
  {
    console.log("ESC pressed, release/lock mouse control of the camera");
  }

  console.log(cameraPos);
}

window.addEventListener('resize', windowResize, false);
window.addEventListener('keydown', handleInput, false);

// call to main
main();
