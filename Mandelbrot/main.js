var camera, scene, renderer;
var geometry, material, mesh;

init();

function init() {
  setup();

  let uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
  };

  geometry = new THREE.PlaneBufferGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
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
// don't need vertex shader

function fragmentShader(){
  return `
    //varying vec3 vUv;
    uniform vec2 res;

    void main(){

      vec2 b = gl_FragCoord.xy / res;

      vec3 coord = vec3(b.x, b.y, b.x);
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
