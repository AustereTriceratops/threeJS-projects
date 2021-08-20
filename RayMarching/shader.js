// TODO: fix grainy renders somehow
// TODO: refactoring and cleanup
// TODO: use sphere SDF when ray is outside (not sure if a good idea when camera is inside the set)


var setup = `
precision highp float;

///============== UNIFORMS ==============
// screen parameters
uniform vec2 res;
uniform float aspect;

// camera rotation
uniform vec3 cameraX;
uniform vec3 cameraY;
uniform vec3 cameraZ;

// camera position
uniform vec3 cameraPos;

`

var surface =`
///============== SURFACE DEFINITIONS ==============

// a 3D surface is defined by f(x, y, z) = 0
// the zeros of f will be found via Newton's method
float evalF( vec3 coords )
{
  float x  = coords.x;
  float y  = coords.y;
  float z  = coords.z;

  float val = 2.0 * pow( x, 4.0 ) + pow( y, 4.0 ) + pow( z, 4.0 ) - 1.0;

  return val;
}

vec3 gradF ( vec3 coords )
{
  float x  = coords.x;
  float y  = coords.y;
  float z  = coords.z;

  vec3 gradient = vec3( 8.0 * x, 4.0 * y, 4.0 * z );

  return gradient;
}
`

var signedDistanceFunctions = `
///============== SDF FUNCTIONS ==============
float sdSphere( vec3 ray, vec3 center, float s )
{
  return length( ray - center ) - s;
}

float sdCube( vec3 ray, vec3 center, float s )
{
  vec3 p = abs( ray - center );
  vec3 q = p - vec3( s, s, s );
  return length( max( q,0.0 ) ) + min( max( q.x,max( q.y,q.z ) ), 0.0 );
}

float sdPlane( vec3 ray, float z )
{
  float dist = abs(ray.z - z);

  return dist;
}

float sdSurface( vec3 ray )
{
  float f = evalF( ray );

  vec3 gradient = gradF( ray );

  float dist = f / length( gradient );

  return dist;
}
`

var normals = `
///============== NORMALS ==============
vec3 exactSphereNormal( vec3 ray, vec3 center, float s )
{
  vec3 normal = normalize(ray - center);

  return normal;
}

vec3 exactCubeNormal( vec3 ray, vec3 center, float s )
{
  vec3 normal;
  vec3 p_ = ray - center;
  vec3 p = abs(p_);
  float max = max(max(p.x, p.y), p.z);

  if (max == p.x)
  {
    normal = sign(p_.x) * vec3(1, 0, 0);
  }
  else if (max == p.y)
  {
    normal = sign(p_.y) * vec3(0, 1, 0);
  }
  else
  {
    normal = sign(p_.z) * vec3(0, 0, 1);
  }

  return normal;
}

vec3 exactSurfaceNormal( vec3 ray )
{
  vec3 norm = normalize( gradF( ray ) );

  return norm;
}
`

var coordinateTransforms =
`
///============ COORDINATE TRANSFORMS ==============
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

var shaderMain = `
// gl_FragCoord in [0,1]
void main()
{
  vec2 uv = toNeg1Pos1(gl_FragCoord.xy);

  // white background
  vec3 color = vec3(1.0, 1.0, 1.0);


  ///============== CAMERA ==============
  // get pxl real space as if camera is centered at origin
  vec3 pxl = (0.8 * uv.x * cameraX) + cameraY + (0.8 * uv.y * cameraZ);
  vec3 ray_norm = normalize( pxl );

  // get coordinates of ray in real space
  vec3 ray = cameraPos.xyz;


  ///============== OBJECTS ==============
  vec3 lightNorm = vec3(0.7071, 0.0, 0.7071);

  vec3 cubeCenter1 = vec3(0.0, 0.0, 0.0);
  float cubeSize1 = 0.4;


  ///============== RAYMARCHING MAIN LOOP ==============

  int RAYMARCHING_ITERATIONS = 80;
  float distance = 0.0;

  // raymarch for 120 iterations
  for (int i = 0; i < RAYMARCHING_ITERATIONS; i++)
  {
    float r1 = sdSurface( ray );
    float radius = r1;

    //float r_min = 0.0005 + 0.002*distance*distance;
    float r_min = 0.004;

    if (radius < r_min)
    {
      color = vec3(0.64, 0.76, 0.78);

      vec3 normal = exactSurfaceNormal( ray );


      ///============== LIGHTING ==============
      // facs will be in interval [-1, 1]
      float fac_d = dot(normal, lightNorm);
      float fac_s = max(0.0, dot(ray_norm, lightNorm));

      // 0.0: total light (i.e white)
      // 1.0: lighting unchanged
      // >1.0: darkened
      float lightExponent = 0.6*(1.0 - fac_d)*(1.0 - fac_d) + 0.4;

      // ambient occlusion
      lightExponent += 4.0*float(i)/float(RAYMARCHING_ITERATIONS);

      color = pow(color, vec3(lightExponent, lightExponent, lightExponent));
      
      break;
    }

    if (distance > 5.0)
    {
      break;
    }

    ray += radius * ray_norm;
    distance += radius;
  }

  gl_FragColor = vec4(color, 1.0);
}
`

var fragmentShader = setup + surface + signedDistanceFunctions + normals + coordinateTransforms + shaderMain;

export {fragmentShader};
