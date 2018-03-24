		let camera, scene, renderer, tick = 0, clock = new THREE.Clock(), controls, container, spawnerOptions, particleSystem, 
			width, prev_total = 0;
		
		let fireworks = [];
		let num_fireworks = 10;
		
		let tex1 = new THREE.TextureLoader().load( "particle2.png" );
		
		let amount = 100;
		let radius = 500;
			
		//width = window.innerwidth;
		width = window.innerWidth/10; //I DIVIDE WIDTH BY 10 TO BETTER REPRESENT THE XYZ COORDINATES FOR FIREWORK POSITION
		let WIDTH = window.innerWidth;
		let HEIGHT = window.innerHeight;
		
		function initExplode(fireworks){
			let positions = new Float32Array( amount * 3 * (fireworks.length));
			let dests = new Float32Array( amount * 3 * (fireworks.length));
			//let colors = new Float32Array( amount * 3 * (fireworks.length));
			let sizes = new Float32Array( amount * (fireworks.length) );
			let size = 10;
			let time = Date.now() * 0.005;
			let to = new THREE.Vector3();
			let range = 4;
			let range_out = 20;
			let vertex = new THREE.Vector3();
				
			for(let i = 0; i < fireworks.length; i++){
				
				for ( let j = 0; j < amount; j++ ) {
				
					vertex.x = fireworks[i].position.x;
					vertex.y = fireworks[i].dest;
					vertex.z = fireworks[i].position.z;
				
					to.x = THREE.Math.randFloat( vertex.x - THREE.Math.randFloat(range, range_out), vertex.x + THREE.Math.randFloat(range, range_out) );
					to.y = THREE.Math.randFloat( vertex.y - THREE.Math.randFloat(range, range_out), vertex.y + THREE.Math.randFloat(range, range_out) );
					to.z = THREE.Math.randFloat( vertex.z - THREE.Math.randFloat(range, range_out), vertex.z + THREE.Math.randFloat(range, range_out) );	
					
					vertex.toArray( positions, (i*300)+(j*3) );
					to.toArray(dests, (i*300)+(j*3));
					
					//color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
					//color.toArray( colors, (i*300)+(j*3) );
						
					//size of each individual spark after explosion
					sizes[(i*100 + j)] = size;
				}
			}
			
				//console.log(positions);
				//console.log(dests);
			
			let geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			//geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
			geometry.addAttribute( 'dest', new THREE.BufferAttribute( dests ) );
			geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
			//geometry.addAttribute('group', new THREE.BufferAttribute( )
			
			let material = new THREE.ShaderMaterial( {
				uniforms: {
					amplitude: { value: 1.0 },
					//color:     { value: new THREE.Color( 0xff0000 ) },
					texture:   { value: tex1 }
				},
				
				vertexShader:   document.getElementById( 'vertexshader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
				blending:       THREE.AdditiveBlending,
				depthTest:      false,
				transparent:    true

			});
			
			let boxOfPoints = new THREE.Points( geometry, material );
			
			//material.color.set(0xff0000);
			
			return boxOfPoints;
		}
		
		firework_main(num_fireworks);
		render_fireworks();
		
		function firework_main(num_fireworks) {
		
			container = document.getElementById( 'container' );
			camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.z = 200;

			scene = new THREE.Scene();
			
			//launch
			particleSystem = new THREE.GPUParticleSystem( {
				maxParticles: 250000
			} );
			
			//var particleSystem = new THREE.ParticleSystem(particleSystem,pMaterial);
			
			scene.add( particleSystem );
			
			//let fireworks = [];
			
			//constructor
			function firework(num_fireworks, fireworks){
				let inc = (width/num_fireworks);
				let dest = 15; //need to change this to appropiate y
				let x  = -(width/2);
				let color = new THREE.Vector3();
				
				for (let i = 0; i < num_fireworks; i++) {
					fireworks.push({
						position: new THREE.Vector3(x, -20, 0), //need to set my y to just off screen
						positionRandomness: .3,
						velocity: new THREE.Vector3(),
						turbulence: .5,
						lifetime: 1, 
						size: 4,
						color,
						//num_fireworks: num_fireworks,
						num_sparks: num_fireworks*amount,
						dest: dest,
						bool: true,
						group_start: prev_total,
						group_end: prev_total+num_fireworks,
						start: true
					});
					x += inc;
				}
				return fireworks; 
			}
			
			//creating 20 firework objects that are stored in fireworks array
			//let num_fireworks = 20;
			console.log("hit");
			
			this.fireworks = firework(num_fireworks, fireworks);
			

			
			spawnerOptions = {
				spawnRate: 5000,
				horizontalSpeed: 1.5,
				verticalSpeed: 1.5,
				timeScale: 1
			};

			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( WIDTH, HEIGHT );
			//window.addEventListener( 'resize', onWindowResize, false );
			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			container.appendChild( renderer.domElement );
			controls = new THREE.TrackballControls( camera, renderer.domElement );
			controls.rotateSpeed = 5.0;
			controls.zoomSpeed = 2.2;
			controls.panSpeed = 1;
			controls.dynamicDampingFactor = 0.3;
			//window.addEventListener( 'resize', onWindowResize, false );

		}

		function render_fireworks() { //might have to pass in fireworks[] array here
			
			//controls.update();
			requestAnimationFrame( render_fireworks );
			//Particles
			//try to incoporate a sin function here for the actual trail
			let delta = clock.getDelta() * spawnerOptions.timeScale;
			tick += delta;
			//console.log(delta);
			if ( tick < 0 ) tick = 0;
			if ( delta > 0 ) {
				
				if(fireworks[fireworks.length-1].position.y <= 15 ){ //15 IS WHERE FIREWORK WILL EXPLODE
					for(let i = 0; i < fireworks.length; i++){
						fireworks[i].position.y = fireworks[i].position.y +0.3;
						fireworks[i].position.z = fireworks[i].position.y +0.003;
					}
					
					for ( let x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
						//console.log("hit delta");
						for(let i = 0; i < fireworks.length; i++){
							particleSystem.spawnParticle( this.fireworks[i] );
						}
					}
					
				} else if(fireworks[fireworks.length-1].position.y >= 15 && fireworks[fireworks.length-1].position.y < 300) { //15 is y explosion prob gonna make this a let later
					
					let group_start = fireworks[prev_total].group_start;
					//console.log(group_start);
					let group_end = fireworks[prev_total].group_end;
					//console.log(group_end);
					//console.log('hit');	
					//console.log(group_end);
					for(let i = group_start; i < group_end; i++){
						fireworks[i].position.y = fireworks[i].position.y + 300;
					}

				}
				
				//this if statement checks the position of the lowest fireworks NOT RIGHT
				if(fireworks[fireworks.length-1].position.y >= fireworks[1].dest){
					//spawnerOptions.spawnRate = 0;
					//move spark trail origin off screen
					
					
					if(fireworks[prev_total].bool == true){
						boxOfPoints = initExplode(fireworks);
						fireworks[prev_total].bool = false;
					}
					//for(let i = fireworks[prev_total-1].group; i < fireworks[prev_total-1].group_end; i++ ) 
						explode(boxOfPoints, fireworks);
				}
					//console.log(fireworks[fireworks.length-1].position.y);
					//console.log(fireworks[fireworks.length-1].dest);
			}
			particleSystem.update( tick );	
			render();
		}
		
		function explode(boxOfPoints, fireworks){
				
				scene.add( boxOfPoints );
				let time = Date.now() * 0.005;

				let attributes = boxOfPoints.geometry.attributes;
			
				let position = boxOfPoints.geometry.attributes.position.array;
				let dest = boxOfPoints.geometry.attributes.dest.array;
				
				//console.log(position.length);
				attributes.size.needsUpdate = true;
				attributes.position.needsUpdate = true;	
				//if(fireworks[prev_total-1].start = true){
				
				num_sparks = fireworks[fireworks.length-1].num_sparks;
				//console.log(num_sparks);
				let start_position = (prev_total * amount)*3;
				//console.log(start_position/3);
				//console.log(fireworks[prev_total-1]);
								
				for ( let i = start_position/3; i <= attributes.size.array.length; i++ ) {
					//only want this to run once...but it's pretty either way
					if(attributes.size.array[ i ] >= -100){
						attributes.size.array[ i ] += 1.5 * Math.sin(i + time );
					}else{
						attributes.size.array[ i ] = -1000;
					}//console.log(attributes.size.array[ i ]);
				}
					//console.log(attributes.size.array.length);
					//fireworks[prev_total-1] = false;}
				
				for (let i = 0; i <= start_position + (num_sparks*3); i++){
					position[i] += ((dest[i] - position[i])/100)-.1;
					
				}
				//console.log(start_position/3);
				//console.log(start_position + (num_sparks*3));
				
				
				//console.log(start_position);
				//console.log(start_position + num_sparks);
				
				//this leaves tiny tiny tiny little dots still
				for ( let i = 0; i <= attributes.size.array.length; i++ ) {
						attributes.size.array[ i ] -= .15;
				}
				
		}
		
		function render() {
			
			renderer.render( scene, camera );
		}

