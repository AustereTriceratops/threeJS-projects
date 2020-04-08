// =================== Classes ===================
class Point{
  constructor(x, y, color=0x41b827){
    this.x = x;
    this.y = y;
    this.color = color;

    this.circle = this.createGeometry();
  }

  createGeometry(){
    let mat = new THREE.MeshBasicMaterial({color: this.color});
    let geom = new THREE.CircleBufferGeometry(0.008, 32);
    let circle = new THREE.Mesh(geom, mat);
    circle.position.set(this.x, this.y, 0);
    scene.add(circle);
    return circle;
  }
}


class Line{
  constructor(x1, y1, x2, y2){
    this.p1 = new THREE.Vector3(x1, y1, 0);
    this.p2 = new THREE.Vector3(x2, y2, 0);
    this.points = [this.p1, this.p2];

    this.createGeometry();
  }

  createGeometry(){
    let mat = new THREE.LineBasicMaterial({color: 0x000000});

    let geom = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line = new THREE.Line(geom, mat);
    scene.add(this.line);

  }
}


class Curve{
  constructor(func, range, domain="x", res=60, alpha=1){
    this.func = func;
    this.range = range;
    this.res = res;
    this.domain = domain;
    this.alpha = alpha;

    this.createDomain();
    this.createCodomain();
    this.createGeometry();
  }

  createDomain(){
    let step = (this.range[1] - this.range[0]) / this.res;
    let arr = new Array(this.res+1);

    for(var i=0; i<arr.length; i++){
      arr[i] = this.range[0] + i*step;
    }
    if(this.domain == 'x'){
      this.x = arr;
    } else if (this.domain == 'y'){
      this.y = arr;
    }
  }

  createCodomain(){
    let arr = new Array(this.res + 1);

    for(var i=0; i < arr.length; i++){
      arr[i] = this.func(this[this.domain][i])  //neat trick
    }

    if(this.domain == 'x'){
      this.y = arr;
    } else if (this.domain == 'y'){
      this.x = arr;
    }
  }

  createPoints(){
    let points = new Array(this.res + 1);

    for(var i = 0; i < points.length; i++){
      points[i] = new THREE.Vector3(this.x[i], this.y[i], 0);
    }
    this.points = points;
  }

  createGeometry(){
    let mat = new THREE.LineBasicMaterial({color: 0x000000});
    mat.color = new THREE.Color(alpha, alpha, alpha);
    this.createPoints();

    let geom = new THREE.BufferGeometry().setFromPoints(this.points);
    this.curve = new THREE.Line(geom, mat);
    scene.add(this.curve);
  }

  updateFunc(func){
    this.func = func;
    this.createCodomain();
    this.createPoints();
    this.curve.geometry.dispose();
    this.curve.geometry.setFromPoints(this.points);
  }
}


class Parabola{
  constructor(f1, f2, d){
    this.focus = [f1, f2];
    this.directix = d;
    this.vec = parabolaVec(this.focus, this.directix);
    this.func = this.funcFromVec(this.vec);
    this.bound = bound(this.vec);
    this.low_intersection = null;
    this.high_intersection=  null;
  }

  funcFromVec(vec){
    function parabola(x){
      return vec["r"]*Math.pow(x - vec["a"], 2) + vec["s"];
    }

    return parabola;
  }
}


class Intersection{ // convenient datatype
  constructor(point, indices, parity){
    this.coord = point;
    this.x = point[0];
    this.y = point[1];
    this.indices = indices;
    this.upper = parity;
  }
}

// ================== Functions ==================

function parabolaFunc(focus, directix){  // focus is float[2]
  pvec = parabolaVec(focus, directix);

  function parabola(x){
    return pvec["r"]*Math.pow(x - pvec["a"], 2) + pvec["s"];
  }

  return parabola;
}

function parabolaVec(focus, directix){  // returns dictionary for r*(x-a)^2 + s
  let r = 1/(2.0*(focus[1] - directix));
  let s =  (focus[1] + directix)/2.0;
  let a = focus[0];

  return {"r": r, "s": s, "a": a};
}

function bound(pvec){ // takes parabola vector
  let y1 =pvec['a'] - Math.pow(-pvec['s']/pvec['r'], 0.5);
  let y2 =pvec['a'] + Math.pow(-pvec['s']/pvec['r'], 0.5);

  let bound;
  if (y1 < y2){
    bound = [y1, y2];
  } else { bound = [y2, y1]; }

  return bound;
}

function nearest_points(list_of_intersections, pivot){
  intersections = list_of_intersections;

  lower_intersections = [];
  upper_intersections = [];

  for (i=0; i < intersections.length; i++){
    if (intersections[i].y < pivot){
      lower_intersections.push(intersections[i]);
    } else { upper_intersections.push(intersections[i]); }
  }

  low = lower_intersections.sort((a, b) => (a.y < b.y) ? 1 : -1)[0];
  high = upper_intersections.sort((a, b) => (a.y > b.y) ? 1 : -1)[0];

  r = [];
  if (low !== undefined){
    r.push(low);
  }
  if (high !== undefined){
    r.push(high);
  }
  return r;
}

function compare_pairs(old_p, new_p){
  // find all common pairs between old_p (a) and new_p (b)
  all_pairs = remove_duplicate_arrays(old_p.concat(new_p));

  old_counts = Array(all_pairs.length).fill(0);
  new_counts = Array(all_pairs.length).fill(0);

  for (var i = 0; i < old_p.length; i++){
    for (j = 0; j < all_pairs.length; j++){
      if (equal_arrays(old_p[i], all_pairs[j])){
        old_counts[j] += 1;
      }
    }
  }
  for (var i = 0; i < new_p.length; i++){
    for (j = 0; j < all_pairs.length; j++){
      if (equal_arrays(new_p[i], all_pairs[j])){
        new_counts[j] += 1;
      }
    }
  }

  df_1 = [all_pairs.length];
  df_2 = [all_pairs.length];
  for (var i = 0; i < all_pairs.length; i++){
    union = Math.min(old_counts[i], new_counts[i]);
    df_1[i] = old_counts[i] - union;
    df_2[i] = new_counts[i] - union;
  }

  different_pairs_1 = [];
  different_pairs_2 = [];

  for (var i = 0; i < all_pairs.length; i++){
    for (var j = 0; j < df_1[i]; j++){
      different_pairs_1.push(all_pairs[i])
    }
    for (var j = 0; j < df_2[i]; j++){
      different_pairs_2.push(all_pairs[i])
    }
  }

  return [different_pairs_1, different_pairs_2];
}

function find_intersections(parabolae, active_indices, k){
  let intersections = [];

  for (var i=0; i < k; i++){
    if (!active_indices.includes(i)){
      continue;
    }
    local_intersections = [];

    // wall intersections count
    let bound = parabolae[i].bound;
    local_intersections.push(new Intersection([0, bound[0]], [i, "l"], [false, null]));
    local_intersections.push(new Intersection([0, bound[1]], [i, "l"], [true, null]));

    let this_func = parabolae[i].func;
    let pvec2 = parabolae[i].vec;
    //new Curve(this_func, [0, 1.0], domain="y", res=60, alpha=1-k/max);  //displaying purposes, erase later

    // find all intersections between parabolae i and j with j < i
    for (var j = 0; j < i; j++){
      if (!active_indices.includes(j)){
        continue;
      }
      let pvec1 = parabolae[j].vec;

      let s = 2.0*pvec2["r"]*(pvec1["a"] - pvec2["a"]);
      let t = s*pvec1["a"] + pvec2["r"]*(Math.pow(pvec2["a"], 2) - Math.pow(pvec1["a"], 2));
      let alpha = pvec2["r"] - pvec1["r"];
      let beta = t + pvec2["s"] - pvec1["s"];

      let resolvent = Math.pow( Math.pow(s, 2) - 4*alpha*beta, 0.5);
      let y1 = pvec1["a"] + (-s + resolvent)/(2.0*alpha);
      let y2 = pvec1["a"] + (-s - resolvent)/(2.0*alpha);
      let x1 = this_func(y1);
      let x2 = this_func(y2);

      let i_parity_1 = (y1 > parabolae[i].focus[0]) ? true : false;
      let i_parity_2 = (y2 > parabolae[i].focus[0]) ? true : false;
      let j_parity_1 = (y1 > parabolae[j].focus[0]) ? true : false;
      let j_parity_2 = (y2 > parabolae[i].focus[0]) ? true : false;

      if (x1 > 0){ // don't bother with intersections offscreen
        local_intersections.push(new Intersection([x1, y1], [i, j], [i_parity_1, j_parity_1]));
      }
      if (x2 > 0){
        local_intersections.push(new Intersection([x2, y2], [i, j], [i_parity_2, j_parity_2]));
      }
    }
    // only two intersections matter, the ones closest to parabola_i's focus
    paired_intersections = nearest_points(local_intersections, parabolae[i].focus[0]);

    // filter out intersections covered by the new parabola
    frontline = [];
    for (var j=0; j < intersections.length; j++){
      y = intersections[j].y;
      x = intersections[j].x;
      if (x > this_func(y)){
        frontline.push(intersections[j]);
      }
    }

    intersections = frontline.concat(paired_intersections);
  }

  return intersections;
}

function active_indices_from_pairs(pairs){
  active_indices = [];
  for (j=0; j < pairs.length; j++){
    if (!active_indices.includes(pairs[j][0])){
      active_indices.push(pairs[j][0])
    }
    if (!active_indices.includes(pairs[j][1])){
      active_indices.push(pairs[j][1])
    }
  }
  return active_indices;
}

function flatten(a){  // a is array of arrays
  let flat = [];

  for (var i = 0; i < a.length; i++){
    for (var j = 0; j < a[i].length; j++){
      flat.push(a[i][j])
    }
  }
  return flat;
}

function find_duplicates(a){
  a_ = [];
  for (var i = 0; i < a.length; i++){
    if (a_.includes(a[i])){
      return a[i];
    } else {
      a_.push(a[i]);
    }
  }
  return null;
}

function remove_duplicates(a){
  result = [];
  for (var i = 0; i < a.length; i++){
    if (!result.includes(a[i])){
      result.push(a[i]);
    }
  }
  return result;
}

function create_parabolae(points, active_indices, directix){
  let p = Array(points.length).fill(0);
  for (var i = 0; i < points.length; i++){
    if (active_indices.includes(i)){
      p[i] = new Parabola(points[i].y, points[i].x, directix);
    }
  }
  return p;
}

function intersection_to_pairs(intersections){
  let pairs = [];
  for (j=0; j < intersections.length; j++){
    pairs.push(intersections[j].indices);
  }
  return pairs
}

function filter_intersections(intersections, pair){
  let result = [];

  // filter to just intersections involving the merging pair (4 max)
  for (var i = 0; i < intersections.length; i++){
    if (intersections[i].indices.includes(pair[0]) || intersections[i].indices.includes(pair[1])){
      result.push(intersections[i]);
    }
  }
  result.sort((a,b) => (a.y > b.y) ? 1 : -1);

  r = [];
  var min_dist = 100;
  for (var i = 0; i < result.length-1; i++){
    if (!equal_arrays(result[i].indices, result[i+1].indices)){
      if (result[i+1].y - result[i].y < min_dist ){
        min_dist = result[i+1].y - result[i].y;
        r = [result[i], result[i+1]]
      }
    }
  }
  return r
}

function a_exclude_b(a,b){ // a is a set, b is an element
  let result = [];

  for (var i = 0; i < a.length; i++){
    if (a[i] != b){
      result.push(a[i]);
    }
  }
  return result;
}

function resolve_trisection(points, trisecting_indices, passing_indices, k, alpha = 0.001){
  let p_0 = create_parabolae(points, trisecting_indices, points[k-1].x + 0.0001); //may be 2 or 3 elements
  let p_1 = create_parabolae(points, trisecting_indices, points[k-1].x + alpha + 0.0001);
  // step size change to be some fraction between points[k-1].x and points[k].x

  intersections_0 = find_intersections(p_0, trisecting_indices, k);
  intersections_0 = filter_intersections(intersections_0, passing_indices);
  pairs_0 = intersection_to_pairs(intersections_0);
  intersections_1 = find_intersections(p_1, trisecting_indices, k);
  intersections_1 = filter_intersections(intersections_1, passing_indices);
  pairs_1 = intersection_to_pairs(intersections_1);

  while (!equal_arrays(pairs_0[0], pairs_1[0]) || !equal_arrays(pairs_0[1], pairs_1[1])){
    alpha = alpha/2;
    let p_0 = create_parabolae(points, trisecting_indices, points[k-1].x + 0.0001);
    let p_1 = create_parabolae(points, trisecting_indices, points[k-1].x + alpha + 0.0001);

    intersections_0 = find_intersections(p_0, trisecting_indices, k);
    intersections_0 = filter_intersections(intersections_0, passing_indices);
    pairs_0 = intersection_to_pairs(intersections_0);
    intersections_1 = find_intersections(p_1, trisecting_indices, k);
    intersections_1 = filter_intersections(intersections_1, passing_indices);
    pairs_1 = intersection_to_pairs(intersections_1);
  }
  //console.log("Full trisection", pairs_0, pairs_1);

  let vertex_y, vertex_x; // doesn't work when one is vertical
  let dx_0 = intersections_0[0].x - intersections_1[0].x;
  let dx_1 = intersections_0[1].x - intersections_1[1].x;
  let s_0 = (intersections_0[0].y - intersections_1[0].y)/dx_0;
  let s_1 = (intersections_0[1].y - intersections_1[1].y)/dx_1;
  c_0 = intersections_0[0].y - s_0*intersections_0[0].x;
  c_1 = intersections_0[1].y - s_1*intersections_0[1].x;

  if (dx_0 == 0){
    vertex_x = intersections_0[0].x;
    vertex_y = s_1*vertex_x + c_1;
  }
  else if (dx_1 == 0){
    vertex_x = intersections_0[1].x;
    vertex_y = s_0*vertex_x + c_0;
  }
  else {
    vertex_x = (c_1 - c_0)/(s_0 - s_1);
    vertex_y = s_0*vertex_x + c_0;
  }

  return [vertex_x, vertex_y];
}



var max = 13;
function fortune(set_of_points){ // return set of lines indicating vornoi boundaries
  let points = set_of_points;
  let borders = [];

  points.sort((p1, p2) => (p1.x > p2.x) ? 1 : -1); // order points by x value

  var active_indices = [];
  var pairs_prev = [];

  for (k = 0; k < max; k++){
    // this should be done more efficiently, converts all points when only some are needed
    parabolae = create_parabolae(points, active_indices, points[k].x);

    // find intersections on beach line
    intersections = find_intersections(parabolae, active_indices, k);
    //intersections.map(i => new Point(i.x, i.y)); // for display
    pairs = intersection_to_pairs(intersections);

    let state = compare_pairs(pairs_prev, pairs);
    s_0 = state[0];
    s_1 = state[1];
    let diff = s_0.length - s_1.length;

    if (diff > 1){
      //console.log("multiple trisections", s_0, s_1);

    } else if (diff == 1){
      let s_flat = flatten(s_0);
      let trisecting_indices = remove_duplicates(s_flat);
      let absorbed = find_duplicates(s_flat);
      let passing = a_exclude_b(trisecting_indices, absorbed);
      let pairs_0, pairs_1;
      let alpha = 0.005

      if (absorbed == 'l'){
        let p_0 = create_parabolae(points, passing, points[k].x); //may be 2 or 3 elements
        let p_1 = create_parabolae(points, passing, points[k].x - 0.005);

        intersections_0 = find_intersections(p_0, trisecting_indices, k);
        intersections_0.sort((a, b) => (a.y > b.y) ? 1 : -1);
        pairs_0 = intersections_0[1].indices;

        intersections_1 = find_intersections(p_1, trisecting_indices, k);
        intersections_1.sort((a, b) => (a.y > b.y) ? 1 : -1);
        if (intersections_1.length < 2){ // sometimes this is empty
          pairs_1 = [];
        } else {pairs_1 = intersections_1[1].indices;}

        let vertex_y;
        if (equal_arrays(pairs_0, pairs_1)){
          let dx = intersections_0[1].x - intersections_1[1].x;
          let dy = intersections_0[1].y - intersections_1[1].y;
          vertex_y = intersections_0[1].y - intersections_0[1].x * dy / dx;
        } else {
          vertex_y = intersections_0[1].y;
        }

        console.log("Trisection at edge", pairs_0, pairs_1);
        new Point(0, vertex_y, color=0x307fa6); // vornoi vertex on left edge

      } else {
        if (passing.includes("l")){
          console.log("edge trisection");
        }

        let [vertex_x, vertex_y] = resolve_trisection(points, trisecting_indices, passing, k, alpha);
        console.log(vertex_x, vertex_y);

        new Point(vertex_x, vertex_y, color=0x307fa6);
      }

      console.log("trisection", s_0, s_1);
    }

    // may need to introduce cell datatype for vertex informatio


    // find intersection with the next point: points[k]
    y_val = points[k].y;
    var min_value = 0;
    new_pair = [k, 'l'];
    for (var i=0; i < k; i++){
      if (!active_indices.includes(i)){
        continue;
      }
      let x = parabolae[i].func(y_val);
      if (x > min_value){
        min_value = x;
        new_pair = [k, i];
      }
    }

    pairs.push(new_pair);
    pairs.push(new_pair);

    //update active indices
    active_indices = flatten(pairs);

    pairs_prev = pairs;
  }
}
