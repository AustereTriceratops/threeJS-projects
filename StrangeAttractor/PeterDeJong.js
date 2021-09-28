w = window.innerWidth;
h = window.innerHeight;
w2 = w/2;
h2 = h/2;

var maxpoints = 5000;
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
var aStep = 0.02
var bMin = -3.0
var bMax = 3.0
var bStep = 0.02
var cMin = -3.0
var cMax = 3.0
var cStep = 0.02
var dMin = -3.0
var dMax = 3.0
var dStep = 0.02
var kMin = 0
var kMax = 0.4
var kStep = 0.001


var gui;


function attractor(){
	var f=1;
	var t = 0;
	while (f<maxpoints){
		x[f] = sin(a*y[f-1]) - cos(b*x[f-1]) 
		y[f] = sin(c*x[f-1]) - cos(d*y[f-1])
		t+=k;
		f+=1;
	}
}

function graph(){
	var j = 0;
	fill(250,100);
  	stroke(230,70);
  	strokeWeight(0.8);
	while (j < maxpoints-1) {
      		ellipse(200+ w2 + xscl*x[j],h2 -yscl*y[j],1.0,1.0);
      		j+=1;
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
