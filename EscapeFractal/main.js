var camera, scene, renderer;
var geometry, material, mesh;
var uniforms;

var aspect = window.innerWidth / window.innerHeight;
var zoom = 4.0;
var offset = new THREE.Vector2(-2.0*aspect, -2.0);

var gui = new dat.GUI({width: 300});
var parameters = {
  a: 1.01,
  b: 0.01,
  c: 0.01,
  d: 0.01,
  e: 0.01,
  f: 0.01
}
for (var key in parameters){
  gui.add(parameters, key, -5.0, 5.0).onChange(updateUniforms);
}

init();

// ===============================================

function init() {
  setup();

  uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    aspect: {type: 'float', value: aspect},
    zoom: {type:'float', value: zoom},
    offset: {type:'vec2', value: offset},
    pset1: {type:'vec3', value: new THREE.Vector3(parameters['a'], parameters['b'], parameters['c'])},
    pset2: {type:'vec3', value: new THREE.Vector3(parameters['d'], parameters['e'], parameters['f'])}
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
precision highp float;
uniform vec2 res;
uniform float aspect;
uniform float zoom;
uniform vec2 offset;

// gui parameters
uniform vec3 pset1;
uniform vec3 pset2;

vec2 cm (vec2 a, vec2 b){
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + b.x*a.y);
}

vec2 conj (vec2 a){
  return vec2(a.x, -a.y);
}

float mandelbrot(vec2 c){
  float alpha = 1.0;
  vec2 z = vec2(0.0 , 0.0);
  vec2 z_0;
  vec2 z_1;
  vec2 z_2;

  for(int i=0; i < 200; i++){  // i < max iterations
    z_2 = z_1;
    z_1 = z_0;
    z_0 = z;

    float x_sq = z_0.x*z_0.x;
    float y_sq = z_0.y*z_0.y;
    vec2 z_sq = vec2(x_sq - y_sq, 2.0*z_0.x*z_0.y);
    vec2 z_1_sq = cm(z_1, z_1);
    vec2 z_2_sq = cm(z_2, z_2);

    z = pset1.x*z_sq + c + pset1.y*cm(z_sq, z_0)
    + pset1.z*z_1_sq + pset2.x*cm(z_1_sq, z_1)
    + pset2.y*z_2_sq + pset2.z*cm(z_2_sq, z_1_sq);

    if(x_sq + y_sq > 12.0){
      alpha = float(i)/200.0; // should be same as max iterations
      break;
    }
  }

  return alpha;
}

void main(){ // gl_FragCoord in [0,1]
  vec2 uv = zoom * vec2(aspect, 1.0) * gl_FragCoord.xy / res + offset;
  float s = 1.0 - mandelbrot(uv);

  vec3 coord = vec3(s, s, s);
  gl_FragColor = vec4(pow(coord, vec3(7.0, 8.0, 5.0)), 1.0);
}
  `
}

// Setup ================================================

function setup(){
  camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: false, precision:'highp' } );
  renderer.setSize( window.innerWidth, window.innerHeight-2 );
  document.body.appendChild( renderer.domElement );
}

// events ================================================

function windowResize() {  //aspect intentionaly not updated
  aspect = window.innerWidth / window.innerHeight;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight-2);
}

function scroll(event){
  let zoom_0 = zoom;
  if ("deltaY" in event){
    zoom *= 1 + event.deltaY*0.0003;
  } else{
    zoom *= 1 + event.deltaY*0.003;
  }

  let space = zoom - zoom_0;
  let mouseX = event.clientX / window.innerWidth;
  let mouseY = 1-event.clientY / window.innerHeight;
  offset = offset.add(new THREE.Vector2(-mouseX*space*aspect, -mouseY*space));

  uniforms['zoom']['value'] = zoom;
  uniforms['offset']['value'] = offset;
}

function updateUniforms(){
  uniforms['pset1']['value'] = new THREE.Vector3(parameters['a'], parameters['b'], parameters['c']);
  uniforms['pset2']['value'] = new THREE.Vector3(parameters['d'], parameters['e'], parameters['f']);
}


window.addEventListener('resize', windowResize, false);
document.addEventListener('wheel', scroll);
