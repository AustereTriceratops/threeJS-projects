import {Simulator} from "./simulator.js";
import {fragmentShader} from "./shader.js";

var geometry, material, mesh;


// Main ================================================
function main()
{
	Simulator.setup();
	
	// add GUI
	var gui = new dat.GUI({width: 250});
	
	for (var key in Simulator.parameters){
	  gui.add(Simulator.parameters, key, -6.0, 6.0).onChange(Simulator.changeParams);
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


Simulator.renderer.domElement.addEventListener('mousemove', Simulator.mouseMove, false);
Simulator.renderer.domElement.addEventListener('click', Simulator.onClick, false);
window.addEventListener('resize', Simulator.windowResize, false);
document.addEventListener('wheel', Simulator.scroll, false);
// window.addEventListener('keydown', Simulator.onKeyDown, false);
// window.addEventListener('keyup', Simulator.onKeyUp, false);

// call to main
main();
