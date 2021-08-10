import {Simulator} from "./simulator.js";
import {fragmentShader} from "./shader.js";


var geometry, material, mesh;


// Main ================================================
function main()
{
	Simulator.setup();

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
	Simulator.animate();
}


window.addEventListener('resize', Simulator.windowResize, false);
window.addEventListener('mousemove', Simulator.mouseMove, false);
window.addEventListener('click', Simulator.mouseClick, false);
window.addEventListener('keydown', Simulator.onKeyDown, false);
window.addEventListener('keyup', Simulator.onKeyUp, false);

// call to main
main();
