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

uniform int order;

// Constants
int MAX_ITERATIONS = 50;
float CUTOFF = 0.0001;
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


vec3 color6 = vec3( 0.855, 0.694, 0.922 );


// imitation of matplotlib plasma colormap
vec3 plasma( float x )
{
  vec3 color = vec3(0.0, 0.0, 0.0);
  x = max( x, 0.0);
  x = min( x, 1.0);

  if (x < 0.25)
  {
    float s = 4.0 * x;
    color = (1.0 - s) * vec3( 0.94, 0.975, 0.131 ) + s*vec3( 0.973416, 0.585761, 0.25154 );
  }
  else if (x < 0.5)
  {
    float s = 4.0 * (x - 0.25);
    color = (1.0 - s) * vec3( 0.973416, 0.585761, 0.25154 ) + s*vec3( 0.798216, 0.280197, 0.469538 );
  }
  else if (x < 0.75)
  {
    float s = 4.0 * (x - 0.5);
    color = (1.0 - s) * vec3( 0.798216, 0.280197, 0.469538 ) + s*vec3( 0.494877, 0.01199, 0.657865 );
  }
  else if (x <= 1.0)
  {
    float s = 4.0 * (x - 0.75);
    color = (1.0 - s) * vec3( 0.494877, 0.01199, 0.657865 ) + s*vec3( 0.050383, 0.029803, 0.527975 );
  }

  return color;
}

// magma colormap
vec3 magma( float x )
{
    vec3 color = vec3(0.0, 0.0, 0.0);
    x = max( x, 0.0);
    x = min( x, 1.0);
  
    if (x < 0.25)
    {
      float s = 4.0 * x;
      color = (1.0 - s) * vec3( 0.001462, 0.000466, 0.013866 ) + s*vec3( 0.316654, 0.07169, 0.48538 );
    }
    else if (x < 0.5)
    {
      float s = 4.0 * (x - 0.25);
      color = (1.0 - s) * vec3( 0.316654, 0.07169, 0.48538 ) + s*vec3( 0.716387, 0.214982, 0.47529 );
    }
    else if (x < 0.75)
    {
      float s = 4.0 * (x - 0.5);
      color = (1.0 - s) * vec3( 0.716387, 0.214982, 0.47529 ) + s*vec3( 0.9867, 0.535582, 0.38221 );
    }
    else if (x <= 1.0)
    {
      float s = 4.0 * (x - 0.75);
      color = (1.0 - s) * vec3( 0.9867, 0.535582, 0.38221 ) + s*vec3( 0.987053, 0.991438, 0.749504 );
    }
  
    return color;
}
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

float complexMagnitudeSq( vec2 a )
{
  return a.x*a.x + a.y*a.y;
}

float complexMagnitude( vec2 a )
{
  return pow( complexMagnitudeSq(a), 0.5 );
}

vec2 complexMultiplication( vec2 a, vec2 b)
{
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

// evaluates a/b = ab*/|b|^2
vec2 complexDivision( vec2 a, vec2 b )
{
  vec2 bConj = complexConjugation( b );
  float bMag = complexMagnitudeSq( b );

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

vec2 newtonsMethodStep(vec2 start, float[6] coeffs )
{
  vec2[6] x_powers;

  x_powers[0] = vec2( 1.0, 0.0 );
  x_powers[1] = start;
  x_powers[2]  = complexSq( x_powers[1] );
  x_powers[3] = complexMultiplication( x_powers[1], x_powers[2] );
  x_powers[4] = complexSq( x_powers[2] );
  x_powers[5] = complexMultiplication( x_powers[1], x_powers[4] );

  // calculate value of polynomial and its gradient at x 
  vec2 f, fGrad;

  for (int i = 0; i < 6; ++i)
  {
    f += coeffs[i] * x_powers[i];
  }

  for (int i = 1; i < 6; ++i)
  {
    fGrad += float(i) * coeffs[i] * x_powers[i - 1];
  }

  // calculate the step
  vec2 step = complexDivision(f, fGrad);

  return start - step;
}

vec3 newtonFractal(vec2 start, float[6] coeffs )
{
  float fac = 100.0;
  vec2 point = start;
  vec2 pointPrev;

  for (int i = 0; i < MAX_ITERATIONS; ++i)
  {
    pointPrev = point;
    point = newtonsMethodStep( point, coeffs );

    float distSq = complexMagnitudeSq(point - pointPrev);

    if ( distSq < CUTOFF )
    {
      fac = ( float(i) + pow( distSq / CUTOFF , 2.0) ) / float(MAX_ITERATIONS);
      break;
    }
  }

  // return the root's coordinates and the time to took to converge
  return vec3( point.xy, fac);
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

  // ===========
  float[] coeffs = float[6](x_0, x_1, x_2, x_3, x_4, x_5);


  // Run newton's method
  vec3 data = newtonFractal( pxl, coeffs );

  vec2 endpoint = data.xy;
  float fac = 2.0 * data.z;

  // Set color of pixel
  //vec3 color;
  vec3 color = magma( 1.0 - fac );

  // if ( endpoint.y > 0.0 )
  // {
  //   color = pow( color4, vec3(fac, fac, fac) );
  // }
  // else
  // {
  //   color = pow( color6, vec3(fac, fac, fac) );
  // }

  gl_FragColor = vec4( color, 1.0 );
}
`

var fragmentShader = setup + palette + coordinateTransforms + complexNumbers + newtonFractal + shaderMain;

export {fragmentShader};
