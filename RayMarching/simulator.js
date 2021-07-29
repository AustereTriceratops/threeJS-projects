class Simulator
{
	// GLOBALS ================================================
	static aspect = window.innerWidth / window.innerHeight;
	static zoom = 1.0;
	static offset = new THREE.Vector2(-0.50*Simulator.aspect, -0.5);
	static uniforms;
	static firstMouseMove = true;
	static mouseMoved = true;

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
	static setup()
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
	static animate()
	{
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
		for (var key in Object.keys(Simulator.updates))
		{
			if (Simulator.updates[key])
			{
				Simulator.uniforms[key]["value"] = Simulator[key];
				Simulator.updates[key] = false;
			}

		}
		
		if (Simulator.mouseMoved)
		{
			Simulator.mouseMoved = false;

			if ( !Simulator.firstMouseMove)
			{
				// rotate the shader camera
				// TODO: maybe take new declarations out of this method
				var zRotation = new THREE.Quaternion();
				zRotation.setFromAxisAngle(Simulator.cameraZ, -Simulator.mouseXDelta/500.0);
				
				var xRotation = new THREE.Quaternion();
				xRotation.setFromAxisAngle(Simulator.cameraX, -Simulator.mouseYDelta/500.0);
	
				var totalRotation = new THREE.Quaternion();
				totalRotation.multiplyQuaternions(xRotation, zRotation);
	
				Simulator.cameraX.applyQuaternion(totalRotation);
				Simulator.cameraY.applyQuaternion(totalRotation);
				Simulator.cameraZ.applyQuaternion(totalRotation);
	
				// set mouse position and reset the difference trackers
				Simulator.mouseX += Simulator.mouseXDelta;
				Simulator.mouseY += Simulator.mouseYDelta;
	
				Simulator.mouseXDelta = 0.0;
				Simulator.mouseYDelta = 0.0;
			}
			else
			{
				Simulator.firstMouseMove = false;
			}
		}
	}


	// EVENTS ================================================
	static windowResize()
	{
		Simulator.aspect = window.innerWidth / window.innerHeight;
		Simulator.camera.aspect =  aspect;
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

	// TODO: make this work with multiple keys down
	static handleInput(event)
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

			Simulator.updates['cameraPos'] = true;
		}
		if (event.keyCode == 83)
		{
			var cameraYDirection = Simulator.cameraY.clone().multiplyScalar(0.01)
			Simulator.cameraPos.sub(cameraYDirection);

			Simulator.updates['cameraPos'] = true;
		}
		if (event.keyCode == 68)
		{
			var cameraXDirection = Simulator.cameraX.clone().multiplyScalar(0.004)
			Simulator.cameraPos.add(cameraXDirection);

			Simulator.updates['cameraPos'] = true;
		}
		if (event.keyCode == 32)
		{
			var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.004)
			Simulator.cameraPos.add(cameraZDirection);

			Simulator.updates['cameraPos'] = true;
		}
		if (event.keyCode == 16)
		{
			var cameraZDirection = Simulator.cameraZ.clone().multiplyScalar(0.004)
			Simulator.cameraPos.sub(cameraZDirection);

			Simulator.updates['cameraPos'] = true;
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
}

export {Simulator};