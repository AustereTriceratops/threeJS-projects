var fragmentShader = `
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

vec2 angleRange = vec2(-45.0, 45.0);
vec2 cameraPlane = vec2(-0.1, 0.1);



// COORDINATE TRANSFORMS ===========
vec2 to0Pos1( vec2 v )
{
  return vec2(aspect, 1.0) * v / res;
}

vec2 toNeg1Pos1( vec2 v )
{
  vec2 w = to0Pos1(v);
  return vec2(2.0*(w.x - 0.5), 2.0*(w.y - 0.5));
}

// maps p in interval a to interval b
float toInterval( vec2 a, vec2 b, float p )
{
  float n = (p - a.x)/(a.y - a.x);
  float m = n * (b.y - b.x) + b.x;
  return m;
}

// SDF FUNCTIONS ===================
float sdSphere( vec3 p, float s )
{
  return length(p) - s;
}

// gl_FragCoord in [0,1]
void main()
{
  float color = 1.0;
  vec2 uv = toNeg1Pos1(gl_FragCoord.xy);

  //coordinate and radius of sphere 
  vec3 sphereCenter = vec3(0.1, 0.2, 0.0);
  float r = 0.3;

  // "camera" is at (0, 0, 1)
  // lens plane is at (0, 0, 0.9) and has lengths of 0.2 on each side

  //vec3 pxl = vec3(cameraPos.x * 0.1 * uv.x, cameraPos.y * 0.1 * uv.y, cameraPos.z - 0.1);
  vec3 pxl = cameraPos + 0.1 * uv.x * cameraX + 0.1 * cameraY + 0.1 * uv.y * cameraZ;
  vec3 ray_norm = normalize(vec3(pxl.x, pxl.y, -0.1));

  // copy pxl to get position of ray in real space
  vec3 ray = vec3(pxl.x, pxl.y, pxl.z);

  // raymarch for 10 iterations
  for (int i = 0; i < 10; i++)
  {
    vec3 diff = ray - sphereCenter;

    float radius = sdSphere( diff, r );

    if (radius < 0.01)
    {
      color = 0.0;
      break;
    }

    ray += radius * ray_norm;
  }

  gl_FragColor = vec4(color, color, color, 1.0);
}
`;
