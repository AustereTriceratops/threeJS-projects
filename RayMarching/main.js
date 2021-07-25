var geometry, material, mesh;
var uniforms;

import {Simulator} from "./simulator.js";
import {fragmentShader} from "./shader.js";


// Main ================================================
function main()
{
  Simulator.Setup();

  // create plane of shader
  geometry = new THREE.PlaneBufferGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: Simulator.uniforms,
    fragmentShader: fragmentShader,
  });

  mesh = new THREE.Mesh(geometry, material);

  Simulator.scene.add(mesh);

  // DEBUGGING ONLY ==================
  var v = new THREE.Quaternion(1, 0, 0, 0);
  
  // ANIMATE ==================
  Simulator.Animate();
}


function handleInput(event)
{
  if (event.keyCode == 87)
  {
    // there should be a class to store the camera's position and rotation
    // which caches these values and updates them when a rotation is applied
    var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01)
    Simulator.cameraPos.add(cameraYDirection);

    // TODO: move uniform updates to another function called during animate()
    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 65)
  {
    var cameraXDirection = Simulator.cameraX.clone().multiplyScalar(0.004)
    Simulator.cameraPos.sub(cameraXDirection);

    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 83)
  {
    var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01)
    Simulator.cameraPos.sub(cameraYDirection);

    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 68)
  {
    var cameraXDirection = Simulator.cameraX.clone().multiplyScalar(0.004)
    Simulator.cameraPos.add(cameraXDirection);

    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 32)
  {
    var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.004)
    Simulator.cameraPos.add(cameraZDirection);

    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 16)
  {
    var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.004)
    Simulator.cameraPos.sub(cameraZDirection);

    Simulator.uniforms['cameraPos']['value'] = Simulator.cameraPos;
  }
  if (event.keyCode == 27)
  {
    console.log("ESC pressed, release/lock mouse control of the camera");
  }
}

window.addEventListener('resize', Simulator.WindowResize, false);
window.addEventListener('keydown', handleInput, false);

// call to main
main();
