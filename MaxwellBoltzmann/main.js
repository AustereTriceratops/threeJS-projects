var scene, camera, renderer;
var aspect = window.innerWidth / window.innerHeight;
var timestep = 0.004;
var particle_radius = 0.01;

// v * dt < r  for accurate simulation


// ================= Physics =================

class Particle{
  constructor(x, y, x_v=0, y_v=0, radius=particle_radius) {
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

  move(dt=timestep){
    let x = this.x_v * dt;
    let y = this.y_v * dt;
    this.x += x;
    this.y += y;
    let alpha, dx;

    //wall detection built into move()
    // useful since move() is called a lot in collision()
    if (this.x < this.r){
      alpha = dt*(this.r - this.x)/x;
      dx = 2*alpha*this.x_v;
      this.x_v = -this.x_v;
      this.x += dx;
      this.circle.translateX(dx);
    }
    if (this.x > aspect-this.r){
      alpha = dt*(aspect - this.r - this.x)/x;
      dx = 2*alpha*this.x_v;
      this.x_v = -this.x_v;
      this.x += dx;
      this.circle.translateX(dx);
    }
    if (this.y > 1-this.r){
      alpha = dt*(1 - this.r - this.y)/y;
      dy = 2*alpha*this.y_v;
      this.y_v *= -1;
      this.y += dy;
      this.circle.translateY(dy);
    }
    if (this.y < 0+this.r){
      alpha = dt*(this.r - this.y)/y;
      dy = 2*alpha*this.y_v;
      this.y_v *= -1;
      this.y += dy;
      this.circle.translateY(dy);
    }

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

        // find positions of p and q the moment of impact, adjust
        p.move(-dt);
        q.move(-dt);
        // pause = true;

        // reflection mechanics to update velocities
        dx = p.x - q.x;
        dy = p.y - q.y;
        r_sq = Math.pow(dx, 2) + Math.pow(dy, 2);
        alpha = dx*dxv + dy*dyv;

        p.x_v -= dx*alpha/(r_sq);
        p.y_v -= dy*alpha/(r_sq);
        q.x_v += dx*alpha/(r_sq);
        q.y_v += dy*alpha/(r_sq);

        // movement for (time_step-dt)
        p.move(dt);
        q.move(dt);
      }
    }
  }
}

function log_momentum(){
  m = 0;
  for (i=0; i<particles.length; i++){
    m += Math.abs(particles[i].x_v);
    m += Math.abs(particles[i].y_v);
  }
  console.log(m);
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
  if (!pause){
    for (a=0; a<2; a++){
      for (i=0; i<particles.length; i++){
        for (j=0; j<i; j++){
          collision(particles[i], particles[j]);
        }
      }
      // detect collisions after particle initialization, then move
      for (i=0; i<particles.length; i++){
        particles[i].move();
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ===================== main =====================

setup();

// size of windows where particles spawn
pr = particle_radius;
x_size = aspect - 2*pr;
y_size = 1 - 2*pr;

var particles = Array(120);
for (i=0; i<particles.length; i++){
  particles[i] = new Particle(
    pr + x_size*Math.random(), pr + y_size*Math.random(), Math.random()-0.5, Math.random()-0.5
  );
  if (i == 0){
    particles[i].circle.material.color.setHex(0x72b886)
  }
}

animate();
