//TODO: Normal calculations
//TODO: write basic shading


var setup = `
precision highp float;

// include uniforms
uniform vec2 res;
uniform float aspect;
uniform float zoom;
uniform vec2 offset;

// camera rotation
uniform vec3 cameraX;
uniform vec3 cameraY;
uniform vec3 cameraZ;

// camera position
uniform vec3 cameraPos;

vec2 cameraPlane = vec2(0.001, 0.001);
`

var signedDistanceFunctions = `
// SDF FUNCTIONS ===================
float sdSphere( vec3 ray, vec3 center, float s )
{
  return length(ray - center) - s;
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
  return vec2(2.0*(w.x - 0.5*aspect), 2.0*(w.y - 0.5));
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
  vec3 color = vec3(1.0, 1.0, 1.0);
  vec2 uv = toNeg1Pos1(gl_FragCoord.xy);

  //=========================
  //coordinate and radius of sphere 
  vec3 sphereCenter = vec3(0.1, 0.2, 0.0);
  vec3 sphereColor = vec3(0.7,0.4,0.8);
  float r = 0.3;
  
  vec3 sphereCenter2 = vec3(0.5, -0.2, -0.6);
  vec3 sphereColor2 = vec3(0.7,0.9,0.7);
  float r2 = 0.3;
  //=========================

  // get pxl real space as if camera is centered at origin
  // should sin() be used here?
  vec3 pxl = cameraPlane.x * uv.x * cameraX + 1.8*cameraPlane.y * cameraY + cameraPlane.y * uv.y * cameraZ;
  vec3 ray_norm = normalize( pxl );

  // copy pxl to get position of ray in real space
  vec3 ray = cameraPos + pxl;

  // raymarch for 40 iterations
  for (int i = 0; i < 40; i++)
  {
    float radius1 = sdSphere( ray, sphereCenter, r );
    float radius2 = sdSphere( ray, sphereCenter2, r2 );

    float radius = min(radius1, radius2);

    if (radius < 0.01)
    {
      if (radius == radius1)
      {
        color = sphereColor;
      }
      if (radius == radius2)
      {
        color = sphereColor2;
      }
      break;
    }

    ray += radius * ray_norm;
  }

  gl_FragColor = vec4(color, 1.0);
}
`

var fragmentShader = setup + signedDistanceFunctions + coordinateTransforms + shaderMain;

export {fragmentShader};
