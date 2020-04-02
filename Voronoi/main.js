var aspect = window.innerWidth / window.innerHeight;

// defined on runtime
var scene, camera, renderer;
var c, vertical;
var points = Array(13);


// ===================== main =====================

function main(){
  setup();

  for(i=0; i<points.length; i++){  // start doing controlled tests
    points[i] = new Point(Math.random(), Math.random(), 0);
  }

  /*points[0] = new Point(0.2, 0.3, 0);
  points[1] = new Point(0.45, 0.5, 0);
  points[2] = new Point(0.3, 0.55, 0);
  points[3] = new Point(0.25, 0.32, 0);
  points[4] = new Point(0.17, 0.7, 0);
  points[5] = new Point(0.36, 0.1, 0);*/

  fortune(points);

  animate();
}


// ==================== Setup ====================

function setup(){
  camera = new THREE.OrthographicCamera(0, aspect, 1, 0, 0, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight-2);
  document.body.appendChild( renderer.domElement );
}

function windowResize() {
  aspect = window.innerWidth / window.innerHeight;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight-2);
}


// =================== Animation ===================

var pause = false;
var t = 0;
var duration = 1000;
t = duration;

function animate(){
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


main();
