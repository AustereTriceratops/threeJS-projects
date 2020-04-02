// ================= Physics =================


class Particle{
  constructor(x, y, x_v=0, y_v=0, radius=particle_radius) {
    this.x = x;
    this.y = y;
    this.x_v = x_v;
    this.y_v = y_v;
    this.v_mag = Math.pow(Math.pow(this.x_v, 2) + Math.pow(this.x_v, 2), 0.5);
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
    let alpha, dx, dy;

    //wall detection built into move()
    // useful since move() is called a lot in collision()
    if (this.x < this.r){
      alpha = dt*(this.r - this.x)/x; // fraction of timestep it's in wall
      dx = alpha*this.x_v;
      this.x_v = -this.x_v*logistic(parameters["heat"], 0.3);
      dx -= alpha*this.x_v;
      this.x += dx;
      this.circle.translateX(dx);
    }
    if (this.x > aspect-this.r){
      alpha = dt*(aspect - this.r - this.x)/x;
      dx = alpha*this.x_v;
      this.x_v = -this.x_v*logistic(parameters["heat"], 0.3);
      dx -= alpha*this.x_v;
      this.x += dx;
      this.circle.translateX(dx);
    }
    if (this.y > 1-this.r){
      alpha = dt*(1 - this.r - this.y)/y;
      dy = alpha*this.y_v;
      this.y_v = -this.y_v*logistic(parameters["heat"], 0.3);
      dy -= alpha*this.y_v;
      this.y += dy;
      this.circle.translateY(dy);
    }
    if (this.y < 0+this.r){
      alpha = dt*(this.r - this.y)/y;
      dy = alpha*this.y_v;
      this.y_v = -this.y_v*logistic(parameters["heat"], 0.3);
      dy -= alpha*this.y_v;
      this.y += dy;
      this.circle.translateY(dy);
    }

    this.circle.translateX(x);
    this.circle.translateY(y);
  }
}


class Population{
  constructor(size=population_size, bin_size=num_bins){
    this.particles = Array(size);
    this.velocity_dist = [];
    this.bins = Array(bin_size);

    // offset + size of windows where particles spawn
    let pr = particle_radius;
    let x_size = aspect - 2*pr;
    let y_size = 1 - 2*pr;

    for (i=0; i<size; i++){  // create particles
      this.particles[i] = new Particle(
        pr + x_size*Math.random(), pr + y_size*Math.random(), 0.7*(Math.random()-0.5), 0.7*(Math.random()-0.5)
      );

      let v_mag = this.particles[i].v_mag; // initialize velocity distribution
      this.velocity_dist.push(v_mag);

      var j;
      for (j=0; j<bin_size; j++){ // initialize bins for the bar graph
        if (v_mag < intervals[j]){
          bins[j] += bin_increment;
          break;
        }
      }
    }
  }

  collision(p, q){
    p = this.particles[p];
    q = this.particles[q];

    if (p.x - 2*p.r < q.x && q.x < p.x + 2*p.r){
      if (p.y - 2*p.r < q.y && q.y < p.y + 2*p.r){
        let dx = p.x - q.x;
        let dy = p.y - q.y;
        let r_sq = Math.pow(dx, 2) + Math.pow(dy, 2);
        let r_0_sq = 4*Math.pow(p.r, 2);

        // collision check
        if (r_sq < r_0_sq){
          let dxv = p.x_v - q.x_v;
          let dyv = p.y_v - q.y_v;

          // find fractional dt
          let a = Math.pow(dxv, 2) + Math.pow(dyv, 2);
          let b = 2*(dx*dxv + dy*dyv);
          let c = r_sq - r_0_sq;
          let dt = (b + Math.pow(Math.pow(b, 2) - 4*a*c, 0.5))/(2*a);

          // find positions of p and q the moment of impact, adjust
          p.move(-dt);
          q.move(-dt);

          // reflection mechanics to update velocities
          dx = p.x - q.x;
          dy = p.y - q.y;
          r_sq = Math.pow(dx, 2) + Math.pow(dy, 2);
          let alpha = dx*dxv + dy*dyv;

          p.x_v -= dx*alpha/(r_sq);
          p.y_v -= dy*alpha/(r_sq);
          p.v_mag = Math.pow(Math.pow(p.x_v, 2) + Math.pow(p.y_v, 2), 0.5);
          q.x_v += dx*alpha/(r_sq);
          q.y_v += dy*alpha/(r_sq);
          q.v_mag = Math.pow(Math.pow(q.x_v, 2) + Math.pow(q.y_v, 2), 0.5);

          // movement for (time_step dt)
          p.move(dt);
          q.move(dt);
        }
      }
    }
  }
}


class BarGraph{
  constructor(bins, bottom_left, top_right){
    this.material = new THREE.MeshBasicMaterial({color:"black", opacity: 0.2, transparent: true});
    this.bins = bins;
    this.bl = bottom_left;
    this.tr = top_right;
    this.bar_width = aspect*(top_right[0]-bottom_left[0]) / bins.length;
    this.max_height = this.tr[1] - this.bl[1];
    this.backdrop = this.create_backdrop();
    this.bars = this.create_bars();
  }

  create_backdrop(){
    let w = aspect*(this.tr[0] - this.bl[0]);
    let h = this.tr[1] - this.bl[1];
    let bd = new THREE.PlaneGeometry(1,1);
    let backdrop = new THREE.Mesh(bd, this.material);
    backdrop.scale.set(w, h, 0);
    backdrop.position.set(aspect*this.bl[0] + w/2, this.bl[1] + h/2, 0 );

    scene.add(backdrop);
    return backdrop;
  }

  create_bars(){
    let w = this.bar_width;
    let h = this.max_height;
    let bars = []

    for (i=0; i<this.bins.length; i++){
      let bar = new THREE.PlaneGeometry(w, this.max_height);
      let barmesh = new THREE.Mesh(bar, this.material);

      barmesh.scale.set(1, 2*this.bins[i], 0);
      barmesh.position.set(i*w + w/2 + aspect*this.bl[0], h*this.bins[i] + this.bl[1], 0);

      bars.push(barmesh);
      scene.add(barmesh);
    }
    return bars;
  }

  update_bins(bins){
    this.bins = bins;
    let w = this.bar_width;
    let h = this.max_height;

    for(i=0; i<this.bars.length; i++){
      let bar = this.bars[i];
      bar.position.set(0, 0, 0);
      bar.scale.set(1, 2*bins[i], 0);
      bar.position.set(i*w + w/2 + aspect*this.bl[0], h*bins[i] + this.bl[1], 0);
    }
  }
}

function logistic(alpha, m){
  return 1-m + 2*m/(1 + Math.exp(-alpha));
}
