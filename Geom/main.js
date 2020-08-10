var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width / height;
var raycaster = new THREE.Raycaster();
var rotation = 0;
var rotationRef = 0;
var verticalRotation = 0;
var verticalRotationRef = 0;
var dragging = false;
var mouse_down = false;
const pi = Math.PI;

// defined on runtime
var scene, camera, renderer;
var mouseX, mouseY, mouseCoords;
var sceneUI, cameraUI, controls;
var mouseRefCoords;

// ===================== main =====================

function main(){
  setup();

  let p = new Circle(0,0, {size:0.3, outlined:true, opacity:0.6})
  p.add_to(scene)

  let c = new ParametricCurve(circlefunc(0.8), [0, 2*pi])
  c.add_to(scene)

  //let gon7 = new ParametricCurve(circlefunc(1.0), [0, 2*pi], {res:7})
  //gon7.add_to(scene)

  let parab = new ParametricCurve(
    parabola(0.05, 0, -0.7), [-aspect, aspect], {closed:true, cap:"bottom"}
  )
  parab.add_to(scene)

  animate();
}


function circlefunc(radius){
  function circ(alpha){
    let x = radius*Math.cos(alpha);
    let y = radius*Math.sin(alpha);

    let s = new THREE.Vector3(x, y, 0);
    return s;
  }

  return circ
}

function parabola(a, b, c){
  function func(alpha){
    let x = alpha;
    let y = a*Math.pow(alpha, 2) + b*alpha + c;

    let s = new THREE.Vector3(x, y, 0);
    return s;
  }

  return func
}

// =================== Animation ===================


function animate(){

  if (dragging){
    camera.position.x = camera.distance*Math.sin(rotation)*Math.cos(verticalRotation);
    camera.position.z = camera.distance*Math.cos(rotation)*Math.cos(verticalRotation);
    camera.position.y = camera.distance*Math.sin(verticalRotation);
    camera.lookAt(0,0,0);
  }


  renderer.autoClear = true;
  renderer.render(scene, camera);
  renderer.autoClear = false;
  renderer.render(sceneUI, cameraUI);


  requestAnimationFrame(animate);
}


// ================= Setup & events =================

function setup(){
  document.addEventListener( 'load', setMouseCoords, false );
  document.addEventListener( 'wheel', scroll, false );
  document.addEventListener( 'mousedown', mouseDown, false );
  document.addEventListener( 'mousemove', onMove, false );
  document.addEventListener( 'mouseup', mouseUp, false );
  document.addEventListener( 'dblclick', doubleClick, false );

  //camera = new THREE.PerspectiveCamera(45, aspect);
  camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 4, -4);
  camera.distance = 1;
  camera.position.set(0, 0, camera.distance);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f6ed);

  cameraUI = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 1, -1);
  sceneUI = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
  renderer.setSize( width, height-2);
  document.body.appendChild( renderer.domElement );

}

function windowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width / height;
  camera.aspect =  aspect;
  camera.updateProjectionMatrix();
  renderer.setSize( width, height-2);
}


function setMouseCoords(event){
  mouseX = 2*event.clientX / width - 1;
  mouseY = 1 - 2*event.clientY / height;
  mouseCoords = new THREE.Vector2(mouseX, mouseY);  // in [-1,1]x[-1,1]
}


function mouseDown(event){
  //console.log("down");
  mouse_down = true;
  dragging = true;

  mouseRefCoords = mouseCoords.clone();
  rotationRef = rotation;
  verticalRotationRef = verticalRotation;
}


function onMove(event){
  setMouseCoords(event);

  if (dragging){
    let delta = mouseCoords.x - mouseRefCoords.x;
    let verticalDelta = mouseCoords.y - mouseRefCoords.y;
    rotation = rotationRef - 1.2*pi*delta;
    verticalRotation = verticalRotationRef - 0.3*pi*verticalDelta;
    verticalRotation = Math.max(Math.min(verticalRotation, 0.5), -0.5);
  }
}


function mouseUp(){
  mouse_down = false;
  dragging = false;

}


function doubleClick(event){

}

function scroll(event){

}

//

main();
