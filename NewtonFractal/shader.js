var setup = `
precision highp float;

// UNIFORMS ===========
uniform vec2 res;
uniform float aspect;
uniform float zoom;
uniform vec2 offset;

// GUI parameters
uniform float x_5;
uniform float x_4;
uniform float x_3;
uniform float x_2;
uniform float x_1;
uniform float x_0;
`

var palette = 
`
// RGB
// 26, 72, 97 (0.102, 0.2824, 0.3804)
vec3 color1 = vec3(0.102, 0.2824, 0.3804);

// 197, 27, 180 (0.773, 0.106, 0.706)
vec3 color2 = vec3(0.773, 0.106, 0.706);

// 0, 224, 187 (0.0, 0.878, 0.733)
vec3 color3 = vec3(0.0, 0.878, 0.733);

// 241, 214, 184 (0.945, 0.839, 0.722)
vec3 color4 = vec3(0.945, 0.839, 0.722);

// 251, 172, 190 (0.984, 0.675, 0.745)
vec3 color5 = vec3(0.984, 0.675, 0.745);
`

var coordinateTransforms =
`
// COORDINATE TRANSFORMS ===========
vec2 to0Pos1( vec2 v )
{
  return vec2(aspect, 1.0) * v / res;
}

vec2 toNeg1Pos1( vec2 v )
{
  vec2 w = to0Pos1(v);
  return vec2(2.0*w.x - aspect, 2.0*w.y - 1.0);
}

// maps p in interval a to interval b
float toInterval( vec2 a, vec2 b, float p )
{
  float n = (p - a.x)/(a.y - a.x);
  float m = n * (b.y - b.x) + b.x;
  return m;
}
`

var complexNumbers =
`
// COMPLEX NUMBERS ===========

vec2 complexConjugation( vec2 a )
{
  return vec2( a.x, -a.y );
}

float complexMagnitude( vec2 a )
{
  return a.x*a.x + a.y*a.y;
}

vec2 complexMultiplication( vec2 a, vec2 b)
{
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

// evaluates a/b = ab*/|b|^2
vec2 complexDivision( vec2 a, vec2 b )
{
  vec2 bConj = complexConjugation( b );
  float bMag = complexMagnitude( b );

  return complexMultiplication( a, bConj ) / bMag;
}

vec2 complexSq( vec2 a )
{
  return vec2( a.x*a.x - a.y*a.y, 2.0*a.x*a.y );
}
`

var newtonFractal = 
`
// FRACTAL RENDERING FUNCTIONS ===========

float julia(vec2 z, vec2 c){
  float alpha = 1.0;
  vec2 z_n;
  vec2 z_n_1;

  for(int i=0; i < 70; i++){  // i < max iterations
    z_n_1 = z_n;
    z_n = z;

    float x_n_sq = z_n.x*z_n.x;
    float y_n_sq = z_n.y*z_n.y;
    vec2 z_n_sq = vec2(x_n_sq - y_n_sq, 2.0*z_n.x*z_n.y);

    // the recurrence equation
    z = z_n_sq + c;


    float z_mag = z.x*z.x + z.y*z.y;
    float z_n_mag = x_n_sq + y_n_sq;

    if(z_mag > 8.0){
      float frac = (4.0 - z_n_mag) / (z_mag - z_n_mag);
      alpha = (float(i) + frac)/150.0; // should be same as max iterations
      break;
    }
  }

  return alpha;
}

float newtonsMethod(vec3 coeffs1, vec3 coeffs2, vec2 start)
{
  return 1.0;
}

float newtonFractal(vec3 coeffs1, vec3 coeffs2, vec2 root1, vec2 root2, vec2 root3, vec2 root4, vec2 root5, int order)
{
  return 1.0;
}
`

var shaderMain = `
// gl_FragCoord in [0, width][0, height]
void main()
{
  // uv is in [0, aspect][0, 1]
  vec2 uv = to0Pos1(gl_FragCoord.xy);

  // coordinates of pixel on plane
  vec2 pxl = (zoom * uv) + offset;

  //float s = abs(1.0 - julia(pxl, vec2(-0.7, 0.12)));
  float s = 0.9;

  vec3 coord = vec3(s, s, s);
  gl_FragColor = vec4(pow(coord, vec3(2.3, 6.15, 3.85)), 1.0);
}
`

var fragmentShader = setup + palette + coordinateTransforms + newtonFractal + shaderMain;

export {fragmentShader};
