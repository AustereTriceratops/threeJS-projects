class Simulator
{
	// GLOBALS ================================================
	static aspect = window.innerWidth / window.innerHeight;
	static zoom = 1.0;
	static offset = new THREE.Vector2(-0.50*Simulator.aspect, -0.5);
	static uniforms;

	// mouse data
	static mouseX = 0.0;
	static mouseY = 0.0;
	static mouseXDelta = 0.0;
	static mouseXDelta = 0.0;
	static trackMouse = false;

	// camera data
	static cameraX = new THREE.Vector3(1.0, 0.0, 0.0);
	static cameraY = new THREE.Vector3(0.0, 0.0, -1.0);
	static cameraZ = new THREE.Vector3(0.0, 1.0, 0.0);
	static cameraPos = new THREE.Vector3(0.0, 0.0, 1.0);

	// THREE.js objects
	static camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);
	static scene = new THREE.Scene();
	static renderer = new THREE.WebGLRenderer( { antialias: false, precision:'highp' } );


    // SETUP ================================================
	static Setup()
	{
		Simulator.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( Simulator.renderer.domElement );

		Simulator.uniforms = {
			res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
			aspect: {type: 'float', value: Simulator.aspect},
			zoom: {type:'float', value: Simulator.zoom},
			offset: {type: 'float', value: Simulator.offset},
			cameraX: {type: 'vec3', value: Simulator.cameraX},
			cameraY: {type: 'vec3', value: Simulator.cameraY},
			cameraZ: {type: 'vec3', value: Simulator.cameraZ},
			cameraPos: {type: 'vec3', value: Simulator.cameraPos},
		};

		Simulator.updates = {
			res: false,
			aspect: false,
			zoom: false,
			offset: false,
			cameraX: false,
			cameraY: false,
			cameraZ: false,
			cameraPos: false,
		};
	}


	// ANIMATION ================================================
	static Animate()
	{
		Simulator.UpdateUniforms();

		Simulator.renderer.render(Simulator.scene, Simulator.camera);
		requestAnimationFrame(Simulator.Animate);
	}

	static UpdateUniforms()
	{
		for (var key in Object.keys(Simulator.updates))
		{
			if (Simulator.updates[key])
			{
				Simulator.uniforms[key]["value"] = Simulator[key];
				Simulator.updates[key] = false;
			}
		}
	}


	// EVENTS ================================================
	static WindowResize()
	{
		Simulator.aspect = window.innerWidth / window.innerHeight;
		Simulator.camera.aspect =  aspect;
		Simulator.camera.updateProjectionMatrix();
		Simulator.renderer.setSize( window.innerWidth, window.innerHeight-2);
	}

	static MouseMove(event)
	{
		if (Simulator.trackMouse)
		{
			console.log("Mouse");
		}
	}
}

export {Simulator};