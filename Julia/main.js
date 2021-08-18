var camera, scene, renderer;
var geometry, material, mesh;
var uniforms;
var mouseX, mouseY;

var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width / height;
var zoom = 3.0;
var res = new THREE.Vector2(width, height);
var offset = new THREE.Vector2(-1.5*aspect, -1.5);
var mouse_down = false;
var need_update = false;
var need_scroll_update = false;


init();

// ===============================================

function init() {
  setup();

  uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(width, height)},
    aspect: {type: 'float', value: aspect},
    zoom: {type:'float', value: zoom},
    offset: {type:'vec2', value: offset},
    c: {type:'vec3', value: new THREE.Vector2(-0.777, -0.239)},
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
  if (need_update){
    uniforms["c"]["value"] = mouseCoords;
    need_update = false;
  }
  if (need_scroll_update){
    uniforms["zoom"]["value"] = zoom;
    uniforms["offset"]["value"] = offset;
    need_scroll_update = false;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// shader ===========================================

function fragmentShader(){
  return `
precision highp float;
uniform vec2 res;
uniform float aspect;
uniform float zoom;
uniform vec2 offset;

// gui parameters
uniform vec2 c;


vec2 cm (vec2 a, vec2 b){
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + b.x*a.y);
}

vec2 conj (vec2 a){
  return vec2(a.x, -a.y);
}

float julia(vec2 z, vec2 c){
  float alpha = 1.0;
  vec2 z_n;
  vec2 z_n_1;

  for(int i=0; i < 150; i++){  // i < max iterations
    z_n_1 = z_n;
    z_n = z;

    float x_n_sq = z_n.x*z_n.x;
    float y_n_sq = z_n.y*z_n.y;
    vec2 z_n_sq = vec2(x_n_sq - y_n_sq, 2.0*z_n.x*z_n.y);

    // the recurrence equation
    z = z_n_sq + c;


    float z_mag = z.x*z.x + z.y*z.y;
    float z_n_mag = x_n_sq + y_n_sq;

    if(z_mag > 8.0){
      float frac = (4.0 - z_n_mag) / (z_mag - z_n_mag);
      alpha = (float(i) + frac)/150.0; // should be same as max iterations
      break;
    }
  }

  return alpha;
}

void main(){ // gl_FragCoord in [0,1]
  vec2 uv = zoom * vec2(aspect, 1.0) * gl_FragCoord.xy / res + offset;
  float s = abs(1.0 - julia(uv, c));

  vec3 coord = vec3(s, s, s);
  gl_FragColor = vec4(pow(coord, vec3(2.3, 6.15, 3.85)), 1.0);
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

window.addEventListener('resize', windowResize, false);
document.addEventListener('wheel', scroll);
document.addEventListener( 'mousedown', mouseDown, false );
document.addEventListener( 'mousemove', onMove, false );
document.addEventListener( 'mouseup', mouseUp, false );


function windowResize() {  //aspect intentionaly not updated
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width/height;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( width, height-2);
}

function scroll(event){
  let zoom_0 = zoom;
  if ("wheelDeltaY" in event){  // chrome vs. firefox
    zoom *= 1 - event.wheelDeltaY*0.0003;
  } else{
    zoom *= 1 + event.deltaY*0.01;
  }

  let space = zoom - zoom_0;
  let x_ = event.clientX / width;
  let y_ = 1-event.clientY / height;
  offset = offset.add(new THREE.Vector2(-x_*space*aspect, -y_*space));

  need_scroll_update = true;
}


function setMouseCoords(event){  //
  mouseX = zoom*aspect*event.clientX / width + offset.x;
  mouseY = zoom*event.clientY / height + offset.y;
  mouseCoords = new THREE.Vector2(mouseX, mouseY);
}

function mouseDown(){
  mouse_down = true;
  need_update = true;
}

function onMove(event){
  setMouseCoords(event)

  if (mouse_down){
    need_update = true;
  }
}

function mouseUp(){
  mouse_down = false;
}
