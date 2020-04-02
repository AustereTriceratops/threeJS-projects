var scene, camera, renderer;
var aspect = window.innerWidth / window.innerHeight;
var timestep = 0.004;
var particle_radius = 0.008;
var population_size = 300;
var num_bins = 20;
var bin_increment = 2.0/population_size;

var intervals = Array(num_bins);
for (i=0; i<num_bins; i++){
  intervals[i] = (i+1)*0.05;
}


// GUI
var gui = new dat.GUI({width: window.innerWidth*0.2});
var parameters = {
  heat: 0.001,
}
for (var key in parameters){
  gui.add(parameters, key, -1.01, 1.01);
}

// defined on runtime
var bins = Array(num_bins).fill(0);
var population;
var graph;

// v * dt < r  for accurate simulation
// ===================== main =====================

function main(){
  setup();

  population = new Population();
  population.particles[0].circle.material.color.setHex(0x72b886);  //set one particle light green
  graph = new BarGraph(bins, [0,0.7], [0.2,1]);

  animate();
}


// ================== setup ==================


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


var pause = false;
function animate(){
  bins = Array(num_bins).fill(0);

  if (!pause){
    for (i=0; i<population.particles.length; i++){
      for (j=0; j<i; j++){
        population.collision(i, j);
      }
    }
    // detect collisions after particle initialization, then move
    for (i=0; i<population.particles.length; i++){
      population.particles[i].move();

      // update velocity distribution and bins
      // may as well use this loop for those things rather than
      // do them separately by calling another loop - messier but more efficient
      v_mag = population.particles[i].v_mag
      population.velocity_dist.push(v_mag);
      for (j=0; j<bins.length; j++){
        if (v_mag < intervals[j]){
          bins[j] += bin_increment;
          break;
        }
      }
    }
    graph.update_bins(bins);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


main();
