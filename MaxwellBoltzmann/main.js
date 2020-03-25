var scene, camera, renderer;
var aspect = window.innerWidth / window.innerHeight;
var p, q;

function init(){
  setup();

  p = new Particle(0.1,0.13, 1, 0.1);
  q = new Particle(0.6, 0);

  animate();
}


var pause = false;
function animate(){
  if (!pause){
    p.move();
    q.move();

    collision(p, q);
    // do ths for all particles p
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ================= Physics =================

class Particle{
  constructor(x, y, x_v=0, y_v=0, radius=0.1) {
    this.x = x;
    this.y = y;
    this.x_v = x_v;
    this.y_v = y_v;
    this.r = radius;
    this.circle = this.create_geometry();
  }

  create_geometry(){
    let geom = new THREE.CircleGeometry(this.r, 32);
    let mat = new THREE.MeshBasicMaterial({color: 0x6481b0});
    let circle = new THREE.Mesh(geom, mat);
    circle.translateX(this.x);
    circle.translateY(this.y);
    scene.add(circle);
    return circle
  }

  move(dt=0.005){
    let x = this.x_v * dt;
    let y = this.y_v * dt;
    this.x += x;
    this.y += y;
    this.circle.translateX(x);
    this.circle.translateY(y);
  }
}

function collision(p, q){
  if (p.x - 2*p.r < q.x && q.x < p.x + 2*p.r){
    if (p.y - 2*p.r < q.y && q.y < p.y + 2*p.r){
      dx = p.x - q.x;
      dy = p.y - q.y;
      r_sq = Math.pow(dx, 2) + Math.pow(dy, 2);
      r_0_sq = 4*Math.pow(p.r, 2);

      // collision check
      if (r_sq < r_0_sq){
        dxv = p.x_v - q.x_v;
        dyv = p.y_v - q.y_v;

        // find fractional dt
        a = Math.pow(dxv, 2) + Math.pow(dyv, 2);
        b = 2*(dx*dxv + dy*dyv);
        c = r_sq - r_0_sq;
        dt = (b + Math.pow(Math.pow(b, 2) - 4*a*c, 0.5))/(2*a);
        console.log(dt);

        // find positions of p and q the moment of impact, adjust
        p.move(-dt);
        q.move(-dt);
        // pause = true;

        // reflection mechanics to update velocities
        dx = p.x - q.x;
        dy = p.y - q.y;
        a_0 = dx*dxv + dy*dyv

        p.x_v -= dx*a_0/(r_sq);
        p.y_v -= dy*a_0/(r_sq);
        q.x_v += dx*a_0/(r_sq);
        q.y_v += dy*a_0/(r_sq);

        // movement for (time_step-dt)
        p.move(dt);
        q.move(dt);
      }
    }
  }
}

// ================== setup ==================

function setup(){
  camera = new THREE.OrthographicCamera(-1*aspect, 1*aspect, 1, -1, 0, 1);

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

init();
