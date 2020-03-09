var camera, scene, renderer;
var geometry, material, mesh;
var uniforms;

var aspect = window.innerWidth / window.innerHeight;

function init() {
  setup();

  uniforms = {
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

// fragment shader ==========================
function fragmentShader(){
  return `
precision highp float;
uniform vec2 res;
uniform float aspect;

vec2 cm (vec2 a, vec2 b){
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + b.x*a.y);
}

float mandelbrot(vec2 c){
  float alpha = 1.0;
  vec2 z = vec2(0.0 , 0.0);

  for(int i=0; i < 200; i++){  // i < max iterations

    float x_sq = z.x*z.x;
    float y_sq = z.y*z.y;
    vec2 z_sq = vec2(x_sq - y_sq, 2.0*z.x*z.y);

    z = z_sq + c;

    if(x_sq + y_sq > 4.0){
      alpha = float(i)/200.0; // should be same as max iterations
      break;
    }
  }
  return alpha;
}

void main(){ // gl_FragCoord in [0,1]
  vec2 uv = 4.0 * vec2(aspect, 1.0) * gl_FragCoord.xy / res -2.0*vec2(aspect, 1.0);
  float s = 1.0 - mandelbrot(uv);

  vec3 coord = vec3(s, s, s);
  gl_FragColor = vec4(pow(coord, vec3(7.0, 8.0, 5.0)), 1.0);
}
  `
}

function animate(){
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function setup(){
  camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer( { antialias: false,   precision:'highp' } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

init();
