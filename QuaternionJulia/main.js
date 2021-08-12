import {Simulator} from "./simulator.js";
import {fragmentShader} from "./shader.js";

var geometry, material, mesh;


// Main ================================================
function main()
{
	Simulator.setup();
	
	// add GUI
	var gui = new dat.GUI({width: 300});
	
	for (var key in Simulator.parameters){
	  gui.add(Simulator.parameters, key, -1.0, 1.0).onChange(Simulator.changeParams);
	}

	// create plane of shader
	geometry = new THREE.PlaneBufferGeometry(2, 2);
	material = new THREE.ShaderMaterial({
		uniforms: Simulator.uniforms,
		fragmentShader: fragmentShader,
	});

	mesh = new THREE.Mesh(geometry, material);

	Simulator.scene.add(mesh);

	// ANIMATE ==================
	Simulator.animate();
}


window.addEventListener('resize', Simulator.windowResize, false);
window.addEventListener('mousemove', Simulator.mouseMove, false);
window.addEventListener('mousedown', Simulator.mouseDown, false);
window.addEventListener('mouseup', Simulator.mouseUp, false);
window.addEventListener('keydown', Simulator.onKeyDown, false);
window.addEventListener('keyup', Simulator.onKeyUp, false);

// call to main
main();
