// ================== Functions ==================



// =================== Classes ===================


class Circle{
  constructor(x, y, {color=0x41b827, size=0.015, interactive=false, epsilon=0.03, outlined=false, opacity=1.0}={}){
    if (!color){color = 0x41b827}
    this.needs_update = false;
    this.epsilon = epsilon;
    this.opacity = opacity;
    this.x = x;
    this.y = y;
    this.xy = [x, y];
    this.size = size
    this.color = color;
    this.interactive = interactive;
    this.highlighted = false;
    this.outlined = outlined;
    if (interactive){
      this.create_hitbox(this.epsilon);
    }

    this.createGeometry();
  }

  func(alpha){
    let x = this.x + this.size*Math.cos(alpha);
    let y = this.y + this.size*Math.sin(alpha);

    let s = new THREE.Vector3(x, y, 0);
    return s;
  }

  createGeometry(){
    let mat = new THREE.MeshBasicMaterial({color: this.color, opacity:this.opacity, transparent:true});
    let geom = new THREE.CircleBufferGeometry(this.size, 32);
    let circle = new THREE.Mesh(geom, mat);
    circle.position.set(this.x, this.y, 0);
    this.fill = circle;

    if (this.outlined){
      this.outline = new ParametricCurve(this.func, [0, 2*Math.PI])
    }
    // outline is awkward class
  }

  add_to(some_scene){ // outline not added to scene for some reason
    some_scene.add(this.fill);
    if (this.outlined){
      this.outline.add_to(some_scene);
    }
    if (this.interactive){
      some_scene.add(this.hitbox);
    }
  }

  update_position(x, y){ // figure out how to handle outline
    this.x = x;
    this.y = y;
    this.xy = [x, y];
    this.fill.position.set(this.x, this.y, 0);
    if (this.interactive){
      this.hitbox.position.set(this.x, this.y, 0);
    }
    this.needs_update = false;
  }

  create_hitbox(epsilon){ // interactivity
    this.hitbox = new Circle(this.x, this.y, {size: epsilon + this.size}).fill;
    this.hitbox.material.transparent = true;
    this.hitbox.material.opacity = 0.0;
  }

  highlight(){
    this.highlighted = true;
    this.fill.material.opacity = 0.9;
  }

  unhighlight(){
    this.highlighted = false;
    this.fill.material.opacity = 1;
  }
}


class Line{
  constructor([x1, y1], [x2, y2], {color=0x000000, epsilon=0.02, interactive=false}={}){
    this.color = color;
    this.epsilon = epsilon;
    this.highlighted = false;
    this.needs_update = false;
    this.interactive = interactive;
    this.setPoints([x1, y1], [x2, y2]);
    this.createGeometry();
    if (this.interactive){
      this.create_hitbox();
    }
  }

  createGeometry(){
    let mat = new THREE.LineBasicMaterial({color: this.color});
    let geom = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line = new THREE.Line(geom, mat);
  }

  add_to(some_scene){
    some_scene.add(this.line);
  }

  create_hitbox(){
    let x_diff = this.p2.x - this.p1.x;
    let y_diff = this.p2.y - this.p1.y;
    let dx, dy;

    if (x_diff == 0){
      dx = this.epsilon;
      dy = 0;
    } else if (y_diff == 0){
      dx = 0;
      dy = this.epsilon;
    } else {
      let line_slope = (y_diff)/(x_diff);
      let s = -1.0/line_slope;
      let alpha = Math.pow(this.epsilon, 2)/(1 + Math.pow(s, 2));
      dx = Math.pow(alpha, 0.5)
      dy = s*dx
    }

    let points = [
        new THREE.Vector3(this.p1.x + dx, this.p1.y + dy, 0),
        new THREE.Vector3(this.p1.x - dx, this.p1.y - dy, 0),
        new THREE.Vector3(this.p2.x + dx, this.p2.y + dy, 0),
        new THREE.Vector3(this.p2.x - dx, this.p2.y - dy, 0)
    ];

    let hitbox_mat = new THREE.MeshBasicMaterial(
      {color: this.color, opacity:0, transparent:true, side:THREE.DoubleSide});

    let fill_geom = new THREE.Geometry();
    fill_geom.vertices = points;
    fill_geom.faces.push(new THREE.Face3(0, 2, 1), new THREE.Face3(1,2,3));
    this.hitbox = new THREE.Mesh(fill_geom, hitbox_mat);
    sceneUI.add(this.hitbox);
  }

  setPoints(p1, p2){
    this.p1 = new THREE.Vector3(p1[0], p1[1], 0);
    this.p2 = new THREE.Vector3(p2[0], p2[1], 0);
    this.points = [this.p1, this.p2];
  }

  updateGeometry(){
    this.line.geometry.setFromPoints(this.points);
    if (this.interactive){
      this.create_hitbox();
    }
    this.needs_update = false;
  }

  find_intermediate_points(n){
    this.intermediate_points = [];
    let x_diff = this.p2.x - this.p1.x;
    let y_diff = this.p2.y - this.p1.y;
    for (var i = 0; i < n; i++){
      let x = this.p1.x + (i+1)*x_diff/(n+1);
      let y = this.p1.y + (i+1)*y_diff/(n+1);
      this.intermediate_points.push(new THREE.Vector3(x, y, 0));
    }
  }

  highlight(){
    this.highlighted = true;
    this.line.material.opacity = 0.9;
  }

  unhighlight(){
    this.highlighted = false;
    this.line.material.opacity = 1;
  }

}


class Rect{
  constructor([x1, y1], [x2, y2], {color=0x000000, opacity=0.2, fill_color=0x000000, outline=true}={}){
    this.color = color;
    this.fill_color = fill_color;
    this.opacity = opacity;
    this.outlined = outline;
    this.p1 = new THREE.Vector3(x1, y1, 0);
    this.p2 = new THREE.Vector3(x2, y1, 0);
    this.p3 = new THREE.Vector3(x2, y2, 0);
    this.p4 = new THREE.Vector3(x1, y2, 0);
    this.points = [this.p1, this.p2, this.p3, this.p4, this.p1];

    this.createGeometry();
  }

  createGeometry(){
    if (this.outlined){
      let mat = new THREE.LineBasicMaterial({color: this.color});
      let geom = new THREE.BufferGeometry().setFromPoints(this.points);
      this.outline = new THREE.Line(geom, mat);
    }

    let fill_mat = new THREE.MeshBasicMaterial(
      {color: this.fill_color, opacity:this.opacity, transparent:true});

    let fill_geom = new THREE.Geometry();
    fill_geom.vertices.push(this.p1, this.p2, this.p3, this.p4);
    fill_geom.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(0, 2, 3));
    this.fill = new THREE.Mesh(fill_geom, fill_mat);

    this.rect = new THREE.Group(this.fill, this.outline);
  }

  add_to(some_scene){
    some_scene.add(this.fill);
    if (this.outlined){
      some_scene.add(this.outline);
    }
  }
}


class SolidRectangle{
  constructor(bottom_left, top_right){
    this.bl = bottom_left;
    this.tr = top_right;
    this.width = aspect*(this.tr[0]- this.bl[0]);
    this.height = this.tr[1] - this.bl[1];

    this.create_backdrop();
  }

  create_backdrop(){
    let mat = new THREE.MeshBasicMaterial({color:"black", opacity: 0.2, transparent: true});
    let bd = new THREE.PlaneGeometry(1,1);
    let backdrop = new THREE.Mesh(bd, mat);
    backdrop.scale.set(this.width, this.height, 0);
    backdrop.position.set(aspect*this.bl[0] + this.width/2, this.bl[1] + this.height/2, 0.1 );
    //sceneUI.add(backdrop);
  }
}


class ControlPad{
  constructor(bottom_left, top_right, {xrange=[0,1], yrange=[0,1], node_color=0x6da5bd}={}){
    this.selected = null;
    this.linkMode = false;
    this.node_color = node_color;
    this.xrange = xrange;
    this.yrange = yrange;
    this.dx = this.xrange[1] - this.xrange[0];
    this.dy = this.yrange[1] - this.yrange[0];
    this.bl = bottom_left;
    this.tr = top_right;
    this.width = this.tr[0] - this.bl[0];
    this.height = this.tr[1] - this.bl[1];
    this.adjust_for_outline();

    this.backdrop = new Rect(this.bl, this.tr, {fill_color:0x574c0a, opacity:0.25, outline:false});
    this.backdrop.fill.translateZ(0.1);
    this.backdrop.add_to(sceneUI);

    this.nodes = [];
    this.node_fibers = [];
    this.links = [];
  }

  in_bounding_box(vec2){ // mouse coordinates between -1 and 1
    if (
      vec2.x <= this.tr[0]/aspect && vec2.y <= this.tr[1] &&
      vec2.x >= this.bl[0]/aspect && vec2.y >= this.bl[1]
    ){
      return true;
    } else { return false; }
  }

  adjust_for_outline(){
    this.bl = [this.bl[0] + 0.001*aspect, this.bl[1] + 0.001];
  }

  mouse_to_local(coords){ //vec2
    let x = this.xrange[0] + this.dx*(aspect*coords.x - this.bl[0])/(this.width);
    let y = this.yrange[0] + this.dy*(coords.y - this.bl[1])/(this.height);
    return new THREE.Vector2(x, y);
  }

  node_to_local(node){ // vec2, vec3, point
    let loc = new THREE.Vector2(node.x, node.y);
    let x = this.xrange[0] + this.dx*(loc.x - this.bl[0])/this.width;
    let y = this.yrange[0] + this.dy*(loc.y - this.bl[1])/this.height;
    return new THREE.Vector2(x, y);
  }

  local_to_world(loc){
    let x = this.bl[0] + this.width*(loc.x - this.xrange[0])/this.dx;
    let y = this.bl[1] + this.height*(loc.y - this.yrange[0])/this.dy;
    return new THREE.Vector2(x, y);
  }

  add_node(loc){
    if (loc.x < this.xrange[1] && loc.y < this.yrange[1] && loc.x > this.xrange[0] && loc.y > this.yrange[0] ){
      let pos = this.local_to_world(loc);
      let ind = this.nodes.length;
      this.nodes.push(new Point(pos.x, pos.y, {interactive: true, color:this.node_color}));
      this.nodes[ind].index = ind;
      this.nodes[ind].link_indices = [];
      this.nodes[ind].add_to(sceneUI);
      this.create_fiber(ind);
    }
  }

  prepare_selected_node(){
    this.selected.needs_update = true;
  }

  update_selected_node(){
    if (this.selected != null && this.selected.needs_update){
      if (this.in_bounding_box(mouseCoords)){
        this.selected.update_position(mouseX*aspect,  mouseY, 0);
      } else{
        /*console.log(mouseCoords, mouseRefCoords);
        let delta_x = (mouseCoords.x - mouseRefCoords.x);
        let delta_y = mouseCoords.y - mouseRefCoords.y;
        let slope = delta_y/delta_x;
        //y = (x - mouseRefCoords.x)*slope + mouseRefCoords.y
        //x = (y - mouseRefCoords.y)/slope + mouseRefCoords.x
        let p_top, p_bottom, p_left, p_right;
        //p_left = [this.bl[0], (this.bl[0] - aspect*mouseRefCoords.x)*slope + mouseRefCoords.y];
        p_right = [this.tr[0], (this.tr[0] - aspect*mouseCoords.x)*slope + mouseRefCoords.y];
        p_top = [(this.tr[1] - mouseRefCoords.y)/slope + aspect*mouseCoords.x, this.tr[1]];
        //p_bottom = [(this.bl[1] - mouseRefCoords.y)/slope + aspect*mouseRefCoords.x, this.bl[1]];
        //let points = [p_left, p_right, p_top, p_bottom];

        //console.log(p_top, p_right);

        if (p_top[0] < p_right[0]){
          this.selected.update_position(p_top[0],  p_top[1], 0);
        } else {
          this.selected.update_position(p_right[0],  p_right[1], 0);
        }*/
      }
    }
  }

  check_for_selections(){
    for (var i = 0; i < controls.nodes.length; i++){
      raycaster.setFromCamera(mouseCoords, cameraUI);
      let intersection = raycaster.intersectObject(this.nodes[i].hitbox);
      if (intersection.length){
        this.selected = this.nodes[i];
        break;
      }
    }
  }

  check_for_highlights(){
    for (var i = 0; i < this.nodes.length; i++){
      raycaster.setFromCamera(mouseCoords, cameraUI);
      let intersection = raycaster.intersectObject(this.nodes[i].hitbox);
      if (intersection.length){
        this.nodes[i].highlight();
      } else {
        this.nodes[i].unhighlight();
      }
    }

    for (var i = 0; i < this.links.length; i++){
      raycaster.setFromCamera(mouseCoords, cameraUI);
      let intersection = raycaster.intersectObject(this.links[i].hitbox);
      if (intersection.length && !mouse_down){
        this.links[i].highlight();
      } else {
        this.links[i].unhighlight();
      }
    }
  }

  create_fiber(ind){ //maybe nodes should cache their local coordinates
    let params = this.node_to_local(this.nodes[ind]);
    let fiber = new ParametricCurve(hopf_fiber(params.x, params.y), [0, 2*pi]);
    fiber.index = ind;
    fiber.add_to(scene);
    this.node_fibers.push(fiber)
  }

  update_fibers(){
    if (this.selected != null){
      let ind = this.selected.index;
      if (this.node_fibers[ind].needs_update){ //is this condition redundant?
        let params = this.mouse_to_local(mouseCoords);
        this.node_fibers[ind].updateFunc(hopf_fiber(params.x,params.y));
      }
    }
  }

  create_link(i, j){  //clean up
    let node_i = this.nodes[i];
    let node_j = this.nodes[j];
    let l = new Line(node_i.xy, node_j.xy, {color:this.node_color, interactive:true});
    l.num_intermediates = 10;
    l.find_intermediate_points(l.num_intermediates);
    l.fibers = [];
    for (var m = 0; m < l.intermediate_points.length; m++){
      let p = l.intermediate_points[m];
      let params = this.node_to_local(p);
      let fiber = new ParametricCurve(hopf_fiber(params.x, params.y), [0, 2*pi]);
      fiber.index = m;
      fiber.add_to(scene);
      l.fibers.push(fiber);
    }
    l.from = i;
    l.to = j;
    this.links.push(l);

    let ind = this.links.length - 1;
    this.links[ind].index = ind;
    this.links[ind].add_to(sceneUI);

    this.nodes[i].link_indices.push(ind);
    this.nodes[j].link_indices.push(ind);
  }

  prepare_selected_links(){
    let inds = this.selected.link_indices; //links that need to be updated

    for (var i = 0; i < inds.length; i++){
      this.links[inds[i]].needs_update = true;
    }
  }

  update_links(){
    if (this.selected != null){
      let inds = this.selected.link_indices;

      for (var i = 0; i < inds.length; i++){
        if (this.links[inds[i]].needs_update){ // is this redundant?
          let node_inds = [this.links[inds[i]].from, this.links[inds[i]].to];
          let p1 = this.nodes[node_inds[0]];
          let p2 = this.nodes[node_inds[1]];
          this.links[inds[i]].setPoints(p1.xy, p2.xy);
          this.links[inds[i]].updateGeometry();
          let l = this.links[inds[i]]
          this.links[inds[i]].find_intermediate_points(l.num_intermediates);

          for (var i = 0; i < l.intermediate_points.length; i++){
            let p = l.intermediate_points[i];
            let params = this.node_to_local(p);
            l.fibers[i].updateFunc(hopf_fiber(params.x, params.y));
          }
        }
      }
    }
  }

  change_link_midpoints(ind, amount){
    for (var m = 0; m < this.links[ind].fibers.length; m++){
      scene.remove(this.links[ind].fibers[m].curve);
    }

    this.links[ind].num_intermediates += amount;
    this.links[ind].find_intermediate_points(this.links[ind].num_intermediates);
    this.links[ind].fibers = [];
    for (var m = 0; m < this.links[ind].intermediate_points.length; m++){
      let p = this.links[ind].intermediate_points[m];
      let params = this.node_to_local(p);
      let fiber = new ParametricCurve(hopf_fiber(params.x, params.y), [0, 2*pi]);
      fiber.index = m;
      fiber.add_to(scene);
      this.links[ind].fibers.push(fiber);
    }
  }
}


class ParametricCurve{ // curve in 3D space
  constructor(func, range, {
      res=140, color=0x000000, closed=false, cap=null,
          }={}){
    this.func = func;
    this.range = range;
    this.res = res;
    this.color = color;
    this.closed = closed;
    this.cap = cap;
    this.needs_update = false;

    this.createGeometry();
  }


  createPoints(){
    let points = new Array(this.res + 1);
    let step = (this.range[1]-this.range[0])/this.res;

    for(var i = 0; i < points.length; i++){
      points[i] = this.func(this.range[0] + i*step);
    }
    if (this.closed){
      if (this.cap == "bottom"){
        points.push(new THREE.Vector3(aspect, -1, 0))
        points.push(new THREE.Vector3(-aspect, -1, 0))
      }
      points.push(points[0]);
    }

    this.points = points;
  }

  createGeometry(){
    this.createPoints();

    let mat = new THREE.LineBasicMaterial({color: this.color});
    let geom = new THREE.BufferGeometry().setFromPoints(this.points);
    this.curve = new THREE.Line(geom, mat);

  }

  updateFunc(func){
    this.func = func;
    this.createPoints();
    this.curve.geometry.dispose();
    this.curve.geometry.setFromPoints(this.points);
    this.needs_update = false;
  }

  add_to(some_scene){
    some_scene.add(this.curve);
  }


}
