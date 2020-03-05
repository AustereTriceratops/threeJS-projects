var camera, scene, renderer;
var geometry, material, mesh;

init();

function init() {
  setup();

  let uniforms = {
    colorA: {type: 'vec3', value: new THREE.Color(0x743bd5)},
    colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)}
  };

  geometry = new THREE.PlaneBufferGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0;

  scene.add(mesh);

  //animate();
  renderer.render(scene, camera);
}

function animate(){
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// shaders ===========================================
function vertexShader(){
  return `
    varying vec3 vUv;
    varying vec4 modelViewPosition;
    varying vec3 vecNormal;

    void main(){
      vUv = position;
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vecNormal = (modelViewMatrix*vec4(normal, 0.0)).xyz;
      gl_Position = projectionMatrix * modelViewPosition;
    }

  `
}

function fragmentShader(){
  return `
    varying vec3 vUv;

    void main(){

      vec2 b = gl_FragCoord.xy;
      vec3 coord = vec3(vUv.z, vUv.y, vUv.y);
      gl_FragColor = vec4(coord, 1.0);
    }
  `
}

// Setup ================================================

function setup(){
  camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight - 2 );
  document.body.appendChild( renderer.domElement );
}


function window_resize() {
  camera.aspect =  window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', window_resize, false);
