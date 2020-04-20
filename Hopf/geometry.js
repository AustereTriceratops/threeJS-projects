// =================== Classes ===================
class Point{
  constructor(x, y, {color=0x41b827, size=0.015, interactive=false}={}){
    if (!color){color = 0x41b827}
    this.x = x;
    this.y = y;
    this.size = size
    this.color = color;
    this.interactive = interactive;
    this.highlighted = false;
    if (interactive){
      this.create_hitbox(0.05)
    }

    this.circle = this.createGeometry();
  }

  createGeometry(){
    let mat = new THREE.MeshBasicMaterial({color: this.color});
    let geom = new THREE.CircleBufferGeometry(this.size, 32);
    let circle = new THREE.Mesh(geom, mat);
    circle.position.set(this.x, this.y, 0);
    return circle;
  }

  add_to(some_scene){
    some_scene.add(this.circle);
    if (this.interactive){
      some_scene.add(this.hitbox);
    }
  }

  update_position(x, y){
    this.x = x;
    this.y = y;
    this.circle.position.set(this.x, this.y, 0);
    if (this.interactive){
      this.hitbox.position.set(this.x, this.y, 0);
    }
  }

  create_hitbox(epsilon){ // interactivity
    this.hitbox = new Point(this.x, this.y, {size: epsilon + this.size}).circle;
    this.hitbox.material.transparent = true;
    this.hitbox.material.opacity = 0.0;
  }

  highlight(){
    this.highlighted = true;
    this.circle.material.opacity = 0.9;
  }

  unhighlight(){
    this.highlighted = false;
    this.circle.material.opacity = 1;
  }
}


class Line{
  constructor([x1, y1], [x2, y2], {color=0x000000}={}){
    this.color = color;
    this.p1 = new THREE.Vector3(x1, y1, 0);
    this.p2 = new THREE.Vector3(x2, y2, 0);
    this.points = [this.p1, this.p2];

    this.createGeometry();
  }

  createGeometry(){
    let mat = new THREE.LineBasicMaterial({color: this.color});
    let geom = new THREE.BufferGeometry().setFromPoints(this.points);
    this.line = new THREE.Line(geom, mat);
  }

  add_to(some_scene){
    some_scene.add(this.line);
  }

  create_hitbox(epsilon){
    let x_diff = this.p2.x - this.p1.x;
    let y_diff = this.p2.y - this.p1.y;
    let dx, dy

    if (x_diff == 0){
      dx = epsilon;
      dy = 0;
    } else if (y_diff == 0){
      dx = 0;
      dy = epsilon;
    } else {
      let line_slope = (y_diff)/(x_diff);
      let s = -1.0/line_slope;
      let alpha = Math.pow(epsilon, 2)/(1 + Math.pow(s, 2));
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
  constructor(bottom_left, top_right, {xrange=[0,1], yrange=[0,1]}={}){
    this.selected = null;
    this.xrange = xrange;
    this.yrange = yrange;
    this.dx = this.xrange[1] - this.xrange[0];
    this.dy = this.yrange[1] - this.yrange[0];
    this.bl = bottom_left;
    this.tr = top_right;
    this.width = this.tr[0] - this.bl[0];
    this.height = this.tr[1] - this.bl[1];
    this.adjust_for_outline();

    this.backdrop = new Rect(this.bl, this.tr, {fill_color:0xff918a, opacity:0.4, outline:false});
    this.backdrop.fill.translateZ(0.1);

    this.nodes = [new Point(top_right[0] - 0.05,top_right[1] - 0.05, {interactive: true, color:0x9452eb})];

    this.backdrop.add_to(sceneUI);
    this.nodes[0].add_to(sceneUI);
  }

  in_bounding_box(vec2){
    if (vec2.x <= this.tr[0]/aspect && vec2.y <= this.tr[1]){
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

  node_to_local(node){
    let loc = new THREE.Vector2(node.x, node.y);
    let x = this.xrange[0] + this.dx*(loc.x - this.bl[0])/(this.width);
    let y = this.yrange[0] + this.dy*(loc.y - this.bl[1])/(this.height);
    return new THREE.Vector2(x, y);

  }
}


class ParametricCurve{ // curve in 3D space
  constructor(func, range, res=60){
    this.func = func;
    this.range = range;
    this.res = res;
    this.needs_update = false;

    this.createGeometry();
  }


  createPoints(){
    let points = new Array(this.res + 1);
    let step = (this.range[1]-this.range[0])/this.res;

    for(var i = 0; i < points.length; i++){
      points[i] = this.func(this.range[0] + i*step);
    }
    this.points = points;
  }

  createGeometry(){
    let mat = new THREE.LineBasicMaterial({color: 0x000000});
    //mat.color = new THREE.Color(alpha, alpha, alpha);
    this.createPoints();

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
