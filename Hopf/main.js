var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width / height;
var raycaster = new THREE.Raycaster();
const pi = Math.PI;
var rotation = 0;
var rotationRef = 0;
var dragging = false;

// defined on runtime
var scene, camera, renderer;
var mouseX, mouseY, mouseCoords;
var sceneUI, cameraUI, controls;
var mouseRefCoords;

// ===================== main =====================

function main(){
  setup();

  controls = new ControlPad([-1*aspect, -1], [-1*aspect + 1.2, -0.4], {xrange: [0, 2*pi], yrange: [0, pi]});
  controls.add_node(new THREE.Vector2(0.2, 0.3));
  controls.add_node(new THREE.Vector2(0.7, 3.1));
  controls.create_link(0, 1);

  animate();
}



function hopf_fiber(a, b){ // a in [0, 2*pi] b in [0, pi]
  function func(alpha){
    let p = new THREE.Vector3( Math.cos(a)*Math.cos(b), Math.sin(a)*Math.cos(b), Math.sin(b));
    // p is a point on 2-sphere

    let norm = 1/Math.pow(2*(1+p.x), 0.5);
    let cost = Math.cos(alpha);
    let sint = Math.sin(alpha);

    /*let q = [
      -norm*(1+p.x)*sint,
      norm*(1+p.x)*cost,
      norm*(p.y*cost + p.z*sint),
      norm*(p.z*cost - p.y*sint)
    ]; */  // fiber on 3-sphere

    let q = [
      norm*(1+p.x)*cost,
      norm*(1+p.x)*sint,
      norm*(-p.z*cost + p.y*sint),
      norm*(p.y*cost + p.z*sint)
    ];

    /* let sigma = 1.0/(1-q[2]);
    let r = new THREE.Vector3(sigma*q[1], sigma*q[3], sigma*q[0]); */
    let sigma = 1.0/(1-q[0]);
    let r = new THREE.Vector3(sigma*q[2], sigma*q[3], sigma*q[1]);
    //project q into 3D space
    return r
  }
  return func
}


// =================== Animation ===================


function animate(){
  controls.update_selected_node();
  controls.update_fibers();
  controls.update_links();

  if (dragging){
    camera.position.x = 6*Math.sin(rotation);
    camera.position.z = 6*Math.cos(rotation);
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
  //console.log("down");
  controls.check_for_selections();

  if (!controls.in_bounding_box(mouseCoords)){
    dragging = true;
  }

  mouseRefCoords = mouseCoords.clone();
  rotationRef = rotation;
}


function onMove(event){
  setMouseCoords(event);

  if (controls.selected != null){
    if (controls.in_bounding_box(mouseCoords)){
      controls.prepare_selected_node();
      controls.prepare_selected_links();

      let ind = controls.selected.index;
      controls.node_fibers[ind].needs_update = true;  //updates on next render call
    } else {
      // compare current mousecoordinate with
    }
  }

  controls.check_for_highlights();

  if (dragging){
    let delta = mouseCoords.x - mouseRefCoords.x;
    rotation = rotationRef - pi*delta;
  }
}


function mouseUp(){
  controls.selected = null;
  dragging = false;
}


function doubleClick(event){
  let local_coords = controls.mouse_to_local(mouseCoords);
  controls.add_node(local_coords);

  controls.check_for_selections();
  if (controls.selected != null){
    let ind = controls.nodes.length - 1;
    controls.create_link(controls.selected.index, ind);
    controls.selected = controls.nodes[ind];
  }
}

function scroll(event){
  console.log(event.deltaY);
}

//

main();
