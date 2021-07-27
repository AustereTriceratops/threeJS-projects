import {Simulator} from "./simulator.js";
import {fragmentShader} from "./shader.js";


var geometry, material, mesh;


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


// TODO: make this work with multiple keys down
// TODO: move uniform updates to another function called during animate()
function handleInput(event)
{
	if (event.keyCode == 87)
	{
		var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01)
		Simulator.cameraPos.add(cameraYDirection);

		Simulator.updates['cameraPos'] = true;
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
		Simulator.trackMouse = !Simulator.trackMouse;
		console.log(Simulator.trackMouse);
	}

	if (event.keyCode == 37)
	{
		console.log("Left arrow key down, rotate camera about its Z axis");
	}
	if (event.keyCode == 38)
	{
		console.log("Up arrow key down, rotate camera about its X axis");
	}
	if (event.keyCode == 39)
	{
		console.log("Right arrow key down, rotate camera about its Z axis");
	}
	if (event.keyCode == 40)
	{
		console.log("Down arrow key down, rotate camera about its X axis");
	}
}

window.addEventListener('resize', Simulator.WindowResize, false);
window.addEventListener('mousemove', Simulator.MouseMove, false);
window.addEventListener('keydown', handleInput, false);

// call to main
main();
