var camera, scene, renderer;
var geometry, material, mesh;
var uniforms;
var aspect = window.innerWidth / window.innerHeight;
var zoom = 4.0;

var mouseX = 0.5;
var mouseY = 0.5;

var offset = new THREE.Vector2(-2.0*aspect, -2.0);

init();

function init() {
  setup();

  uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    aspect: {type: 'float', value: aspect},
    zoom: {type:'float', value: zoom},
    offset: {type:'vec2', value: offset}
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

  for(int i=0; i < 500; i++){  // i < max iterations
    z_2 = z_1;
    z_1 = z_0;
    z_0 = z;

    float x_sq = z_0.x*z_0.x;
    float y_sq = z_0.y*z_0.y;
    vec2 z_sq = vec2(x_sq - y_sq, 2.0*z_0.x*z_0.y);

    z = z_sq + 1.0*c + 0.8*cm(z_1, z_1);

    if(x_sq + y_sq > 6.0){
      alpha = float(i)/500.0; // should be same as max iterations
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

  renderer = new THREE.WebGLRenderer( { antialias: true, precision:'highp' } );
  renderer.setSize( window.innerWidth, window.innerHeight - 2 );
  document.body.appendChild( renderer.domElement );
}


function window_resize() {
  aspect = window.innerWidth / window.innerHeight;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function scroll(event){
  let zoom_0 = zoom;
  zoom *= 1 - event.wheelDeltaY*0.0003;

  let space = zoom - zoom_0;
  mouseX = event.clientX / window.innerWidth;
  mouseY = 1-event.clientY / window.innerHeight;
  offset = offset.add(new THREE.Vector2(-mouseX*space*aspect, -mouseY*space));

  uniforms['zoom']['value'] = zoom;
  uniforms['offset']['value'] = offset;

}


window.addEventListener('resize', window_resize, false);
document.addEventListener( 'mousewheel', scroll, false );
