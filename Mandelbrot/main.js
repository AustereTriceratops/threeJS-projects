var camera, scene, renderer;
var geometry, material, mesh;
var aspect = window.innerWidth / window.innerHeight;

init();

function init() {
  setup();

  let uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    aspect: {type: 'float', value: aspect}
  };

  geometry = new THREE.PlaneBufferGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
  });

  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  animate();
}

function animate(){
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// shaders ===========================================
// don't need vertex shader

function fragmentShader(){
  return `
uniform vec2 res;
uniform float aspect;

float mandelbrot(vec2 c){
  float alpha = 1.0;
  vec2 z = vec2(0.0 , 0.0);

  for(int j=0; j < 80; j++){
    z = vec2(z.x*z.x - z.y*z.y + c.x, 2.0*z.x*z.y + c.y);

    if(z.x*z.x + z.y*z.y > 4.0){
      alpha = float(j)/50.0;
      break;
    }
  }

  return alpha;
}

void main(){

  vec2 uv = vec2(4.0*aspect, 4.0) * gl_FragCoord.xy / res - vec2(2.0*aspect, 2.0);
  float s = mandelbrot(uv);

  vec3 coord = vec3(s, s, s);
  gl_FragColor = vec4(pow(coord, vec3(0.5, 0.5, 0.5)), 1.0);
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
  aspect = window.innerWidth / window.innerHeight;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', window_resize, false);
