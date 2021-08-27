import {findRoots} from "./roots.js";

class Simulator
{
	// GLOBALS ================================================
	// screen data
	static aspect = window.innerWidth / window.innerHeight;
	static zoom = 2.0;
	static offset = new THREE.Vector2( -Simulator.aspect, -1.0 );
	
	// mouse data
	static firstMouseMove = true;
	static mouseMoved = true;
	static mouseX = 0.0;
	static mouseY = 0.0;
	static mouseXDelta = 0.0;
	static mouseXDelta = 0.0;
	static trackMouse = false;

	// camera data
	static camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);

	// data passed to shader
	static parameters = {
		x_5: 1.381,
		x_4: 1.317,
		x_3: 0.201,
		x_2: 1.511,
		x_1: -0.49,
		x_0: -1.701,
	}

	static uniforms = {
		res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
		aspect: { value: Simulator.aspect },
		zoom: { value: Simulator.zoom },
		offset: { value: Simulator.offset },
		x_5: { value: Simulator.parameters.x_5 },
		x_4: { value: Simulator.parameters.x_4 },
		x_3: { value: Simulator.parameters.x_3 },
		x_2: { value: Simulator.parameters.x_2 },
		x_1: { value: Simulator.parameters.x_1 },
		x_0: { value: Simulator.parameters.x_0 },
		order: { value: 5 },
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
			aspect: false,
			zoom: false,
			polynomial: true,
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
		if (Simulator.mouseMoved)
		{
			Simulator.mouseMoved = false;
			
			if ( !Simulator.firstMouseMove)
			{
			}
			else
			{
				Simulator.firstMouseMove = false;
			}
		}

		if (Simulator.updates.aspect)
		{
			Simulator.uniforms.res.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
			Simulator.uniforms.aspect.value = window.innerWidth / window.innerHeight;
		}

		if (Simulator.updates.zoom)
		{
			Simulator.uniforms.zoom.value = Simulator.zoom;
			Simulator.uniforms.offset.value = Simulator.offset;
		}

		if (Simulator.updates.polynomial)
		{
			// set polynomial coefficients
			Simulator.uniforms.x_5.value = Simulator.parameters.x_5;
			Simulator.uniforms.x_4.value = Simulator.parameters.x_4;
			Simulator.uniforms.x_3.value = Simulator.parameters.x_3;
			Simulator.uniforms.x_2.value = Simulator.parameters.x_2;
			Simulator.uniforms.x_1.value = Simulator.parameters.x_1;
			Simulator.uniforms.x_0.value = Simulator.parameters.x_0;

			let x_5 = Simulator.uniforms.x_5;
			let x_4 = Simulator.uniforms.x_4;
			let x_3 = Simulator.uniforms.x_3;
			let x_2 = Simulator.uniforms.x_2;
			let x_1 = Simulator.uniforms.x_1;
			let x_0 = Simulator.uniforms.x_0;

			let polynomial = [x_0, x_1, x_2, x_3, x_4, x_5];

			// remove high-order terms with 0 coefficients
			// e.g. (1 - 0*x + 0.4*x^2 + 0*x^3 + 0*x^4) becomes (1 - 0*x + 0.4*x^2)
			for (let i = 5; i > 0; i--)
			{
				if (Math.abs(polynomial[i]) < 0.00001)
				{
					polynomial.pop();
				}
				else
				{
					break;
				}
			}

			let order = polynomial.length - 1;

			Simulator.uniforms.order = order;

			let roots = findRoots(polynomial);

			// transpose root array from 2xN to Nx2
			let rootsT = [];

			for (let i = 0; i < order; ++i)
			{
				rootsT.push([roots[0][i], roots[1][i]]);
			}
		}

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
	}

	// EVENTS ================================================
	static windowResize()
	{
		Simulator.aspect = window.innerWidth / window.innerHeight;
		Simulator.camera.aspect = Simulator.aspect;
		Simulator.camera.updateProjectionMatrix();
		Simulator.renderer.setSize( window.innerWidth, window.innerHeight);

		// this flag causes both aspect and res to be updated
		Simulator.updates.aspect = true;
	}

	static scroll(event)
	{
		let zoom_0 = Simulator.zoom;

		// Chrome and Firefox both handle scroll events differently
		if ("wheelDeltaY" in event){
			Simulator.zoom *= 1 - event.wheelDeltaY*0.0003;
		} else{
			Simulator.zoom *= 1 + event.deltaY*0.01;
		}
		
		// change the offset depending on where the mouse is on the screen
		// this essentially zooms toward where the cursor is
		let space = Simulator.zoom - zoom_0;
		let x_ = event.clientX / window.innerWidth;
		let y_ = 1 - event.clientY / window.innerHeight;
		let delta_offset = new THREE.Vector2( -x_ * space * Simulator.aspect, -y_ * space );

		Simulator.offset.add( delta_offset );
		
		// both the zoom and the offset need to be updated
		Simulator.updates.zoom = true;
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

	static onClick(event)
	{
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

	static changeParams()
	{
		Simulator.updates.polynomial = true;
	}
}

export {Simulator};