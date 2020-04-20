var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width / height;
var raycaster = new THREE.Raycaster();
const pi = Math.PI;

// defined on runtime
var scene, camera, renderer;
var mouseX, mouseY, mouseCoords;
var sceneUI, cameraUI, controls;
var a, fiber, l1;


// ===================== main =====================

function main(){
  setup();

  controls = new ControlPad([-1*aspect, -1], [-1*aspect + 1.2, -0.4], {xrange: [0, 2*pi], yrange: [0, pi]});
  params = controls.node_to_local(controls.nodes[0]);

  l1 = new Line([0,0], [0.7,0]);
  l1.create_hitbox(0.05);
  //l1.add_to(sceneUI);

  animate();
}



function hopf_fiber(a, b){ // a in [0, 2*pi] b in [0, pi]
  function func(alpha){
    let p = new THREE.Vector3(Math.cos(a)*Math.sin(b), Math.sin(a)*Math.sin(b), Math.cos(b));
    // p is a point on 2-sphere

    let norm = 1/Math.pow(2*(1+p.x), 0.5);
    let cost = Math.cos(alpha);
    let sint = Math.sin(alpha);

    let q = [
      -norm*(1+p.x)*sint,
      norm*(1+p.x)*cost,
      norm*(p.y*cost + p.z*sint),
      norm*(p.z*cost - p.y*sint)
    ];   // fiber on 3-sphere

    let sigma = 1.0/(1-q[0]);
    let r = new THREE.Vector3(sigma*q[3], sigma*q[1], sigma*q[2]);
    //project q into 3D space
    return r
  }
  return func
}


// =================== Animation ===================


function animate(){
  if (controls.selected != null){
    let ind = controls.selected.index;
    if (controls.fibers[ind].needs_update){
      let params = controls.mouse_to_local(mouseCoords);
      controls.fibers[ind].updateFunc(hopf_fiber(params.x,params.y));
    }
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
  document.addEventListener( 'mousedown', mouseDown, false );
  document.addEventListener( 'mousemove', onMove, false );
  document.addEventListener( 'mouseup', mouseUp, false );
  document.addEventListener( 'dblclick', doubleClick, false );

  camera = new THREE.PerspectiveCamera(45, aspect);
  camera.position.set(0, 0, 6);
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
  mouseCoords = new THREE.Vector2(mouseX, mouseY);
}

function mouseDown(event){
  for (var i = 0; i < controls.nodes.length; i++){
    controls.check_for_selection(i);
  } //break loop once selection found

  let intersection2 = raycaster.intersectObject(l1.hitbox);
  if (intersection2.length){
    controls.selected = l1;
    console.log("line selected");
  }
}

function onMove(event){
  mouseX = 2*event.clientX / width - 1;
  mouseY = 1 - 2*event.clientY / height;
  mouseCoords = new THREE.Vector2(mouseX, mouseY);

  if (controls.selected != null){
    if (controls.in_bounding_box(mouseCoords)){
      controls.selected.update_position(mouseX*aspect,  mouseY, 0);

      let ind = controls.selected.index;
      controls.fibers[ind].needs_update = true;  //updates on next render call
    }
  }

  for (var i = 0; i < controls.nodes.length; i++){
    controls.check_for_highlight(i);
  }

}

function mouseUp(){
  controls.selected = null;
}

function doubleClick(event){
  let local_coords = controls.mouse_to_local(mouseCoords);
  controls.add_node(local_coords);
}

//

main();
