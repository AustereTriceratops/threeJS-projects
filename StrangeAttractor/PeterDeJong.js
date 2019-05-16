w = window.innerWidth;
h = window.innerHeight;
w2 = w/2;
h2 = h/2;

var maxpoints = 15000;
var x = new Array(maxpoints).fill(0);
var y = new Array(maxpoints).fill(0);

var xscl = (w - 150)/6;
var yscl = h/6;

var a = -0.8;
var b = 0.7;
var c = -0.7;
var d = 1.6;
var k = 0.01;

var aMin = -3.0
var aMax = 3.0
var aStep = 0.025
var bMin = -3.0
var bMax = 3.0
var bStep = 0.025
var cMin = -3.0
var cMax = 3.0
var cStep = 0.025
var dMin = -3.0
var dMax = 3.0
var dStep = 0.025
var kMin = 0
var kMax = 0.4
var kStep = 0.001


var gui;


function update_params(){
	a+= 0.012;
  b+= 0.01;
  c+= 0.014;
  d-= 0.011;
}

function attractor(){
	var f=1;
	var t = 0;
	while (f<maxpoints){
		x[f] = sin(a*y[f-1]) - cos(b*x[f-1]) + sin(t);
		y[f] = sin(c*x[f-1]) - cos(d*y[f-1]) + cos(t);
		t+=k;
		f+=1;
	}
}



function setup() {
  createCanvas(w, h);

	gui = createGui('parameters');
	gui.addGlobals('a','b', 'c','d', 'k');

	noLoop();
}


gui.show();

function draw() {

	background(70);


	attractor();
	graph();
}
