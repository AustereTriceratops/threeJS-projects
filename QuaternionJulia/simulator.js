class Simulator
{
	// GLOBALS ================================================
	static aspect = window.innerWidth / window.innerHeight;
	static offset = new THREE.Vector2(-0.50*Simulator.aspect, -0.5);
	static firstMouseMove = true;
	static mouseMoved = true;
	static frameCounter = 0;
	
	// mouse data
	static mouseX = 0.0;
	static mouseY = 0.0;
	static mouseXDelta = 0.0;
	static mouseXDelta = 0.0;
	static trackMouse = false;

	// keyboard input data
	static keyTracker = {
		"w": false,
		"a": false,
		"s": false,
		"d": false,
		" ": false,
		"Shift": false,
	};

	// camera data
	static camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);
	static cameraX = new THREE.Vector3(-0.61, 0.0, -0.79);
	static cameraY = new THREE.Vector3(-0.79, 0.0, 0.61);
	static cameraZ = new THREE.Vector3(0.0, 1.0, 0.0);
	static cameraPos = new THREE.Vector3(1.15, -0.21, -1.2);
	
	//Coordinate data
	static globalX = new THREE.Vector3(1.0, 0.0, 0.0);
	static globalY = new THREE.Vector3(0.0, 1.0, 0.0);
	static globalZ = new THREE.Vector3(0.0, 0.0, 1.0);

	// data passed to shader
	static uniforms = {
		res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
		aspect: {type: 'float', value: Simulator.aspect},
		offset: {type: 'float', value: Simulator.offset},
		cameraX: {type: 'vec3', value: Simulator.cameraX},
		cameraY: {type: 'vec3', value: Simulator.cameraY},
		cameraZ: {type: 'vec3', value: Simulator.cameraZ},
		cameraPos: {type: 'vec3', value: Simulator.cameraPos},
	};
	
	// THREE.js objects
	static scene = new THREE.Scene();
	static renderer = new THREE.WebGLRenderer( { antialias: false, precision:'highp' } );


    // SETUP ================================================
	static setup()
	{
		Simulator.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( Simulator.renderer.domElement );

		Simulator.updates = {
			res: false,
			aspect: false,
			offset: false,
		};
	}


	// ANIMATION ================================================
	static animate()
	{
		Simulator.frameCounter++;
		Simulator.updateUniforms();

		Simulator.renderer.render(Simulator.scene, Simulator.camera);
		requestAnimationFrame(Simulator.animate);
	}
	
	static updateUniforms()
	{
		/**
		* Simulator.updates flags which uniforms need to be updated each frame
		* This method runs through that dictionary and updates the shader
		* uniforms which have been flagged for updating.
		* 
		* Running this every frame is more efficient than running it after every event.
		*/
		for (var key in Simulator.updates)
		{
			Simulator.updates[key] = false;
		}

		Simulator.updateCameraPosition();
		
		if (Simulator.mouseMoved)
		{
			Simulator.mouseMoved = false;
			
			if ( !Simulator.firstMouseMove)
			{
				Simulator.updateCameraRotation()
			}
			else
			{
				Simulator.firstMouseMove = false;
			}
		}
		
		// there was a bug where some keys in keyTracker were stuck on true after the keyUp event
		// failed to register. Resetting everything in keyTracker to false after every frame made 
		// movement jump, stop, and start again since that's how the timing of the keydown event works.
		// So, this is a way around that by registering the first move as normal, and then resetting 
		// everything after 10 frames to avoid input getting stuck
		if (Simulator.frameCounter == 10)
		{
			for (var key in Simulator.keyTracker)
			{
				Simulator.keyTracker[key] = false;
			}

			Simulator.frameCounter = 0;
		}
	}
	
	// update the camera's position when a given key has been held down
	static updateCameraPosition()
	{
		if (Simulator.keyTracker["w"])
		{
			var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01);
			Simulator.cameraPos.add(cameraYDirection);
		}
		if (Simulator.keyTracker["a"])
		{
			var cameraXDirection = Simulator.cameraX.clone().multiplyScalar(0.01);
			Simulator.cameraPos.sub(cameraXDirection);
		}
		if (Simulator.keyTracker["s"])
		{
			var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01);
			Simulator.cameraPos.sub(cameraYDirection);
		}
		if (Simulator.keyTracker["d"])
		{
			var cameraXDirection = Simulator.cameraX.clone().multiplyScalar(0.01);
			Simulator.cameraPos.add(cameraXDirection);
		}
		if (Simulator.keyTracker[" "])
		{
			var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.01);
			Simulator.cameraPos.add(cameraZDirection);
		}
		if (Simulator.keyTracker["Shift"])
		{
			var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.01);
			Simulator.cameraPos.sub(cameraZDirection);
		}
	}

	static updateCameraRotation()
	{
		// rotate the shader camera
		// TODO: maybe take new declarations out of this method

		let zRotation = new THREE.Quaternion();
		let xRotation = new THREE.Quaternion();

		zRotation.setFromAxisAngle(Simulator.globalY, -Simulator.mouseXDelta/300.0);
		
		Simulator.cameraX.applyQuaternion(zRotation);
		Simulator.cameraY.applyQuaternion(zRotation);
		Simulator.cameraZ.applyQuaternion(zRotation);
		
		xRotation.setFromAxisAngle(Simulator.cameraX, -Simulator.mouseYDelta/300.0);
		
		Simulator.cameraX.applyQuaternion(xRotation);
		Simulator.cameraY.applyQuaternion(xRotation);
		Simulator.cameraZ.applyQuaternion(xRotation);

		// set mouse position and reset the difference trackers
		Simulator.mouseX += Simulator.mouseXDelta;
		Simulator.mouseY += Simulator.mouseYDelta;

		Simulator.mouseXDelta = 0.0;
		Simulator.mouseYDelta = 0.0;
	}


	// EVENTS ================================================
	static windowResize()
	{
		// TODO: aspect should be passed to shader camera, not the "real" camera
		Simulator.aspect = window.innerWidth / window.innerHeight;
		Simulator.camera.aspect =  Simulator.aspect;
		Simulator.camera.updateProjectionMatrix();
		Simulator.renderer.setSize( window.innerWidth, window.innerHeight-2);
	}

	static mouseMove(event)
	{
		if (Simulator.trackMouse)
		{
			// track how much the mouse has changed from the last animation frame
			Simulator.mouseXDelta = event.clientX - Simulator.mouseX;
			Simulator.mouseYDelta = event.clientY - Simulator.mouseY;

			Simulator.mouseMoved = true;
		}
	}

	static mouseClick(event)
	{
		// click the mouse to have the camera follow/unfollow the mouse
		Simulator.trackMouse = !Simulator.trackMouse;

		Simulator.mouseX = event.clientX;
		Simulator.mouseY = event.clientY;
	}

	static onKeyDown(event)
	{
		if (event.key in Simulator.keyTracker)
		{
			Simulator.keyTracker[event.key] = true;
		}
	}

	static onKeyUp(event)
	{
		if (event.key in Simulator.keyTracker)
		{
			Simulator.keyTracker[event.key] = false;
		}
	}
}

export {Simulator};