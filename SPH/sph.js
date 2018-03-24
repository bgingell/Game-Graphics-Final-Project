// Brent Gingell
// bgingell@ucsc.edu
// smoothed particle hydrodynamics
let pos_tex, vel_tex, density_tex, neighbor_tex;
let tex_size = 128;
let grid_vol = 24;
let uni = [];

/*function main(){
    let container = document.getElementById('container');
    let camera, scene, renderer;

    camera = new THREE.PerspectiveCamera(45.0,
                    window.innerWidth/window.innerHeight, .1, 1000);
    camera.position.z = 150;
    camera.position.x = 70;
    camera.position.y = 60;
    let controls = new THREE.OrbitControls( camera );
    controls.update();

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    if ( ! renderer.extensions.get( "OES_texture_float" ) ) {
        return "No OES_texture_float support for float textures.";
    }
    let sph_points = initPoints();
    scene.add(sph_points);

    let sph_buffers = initSPHBuffers();

    function animate(){
        requestAnimationFrame(animate);

        renderSPH(renderer, scene, camera,sph_buffers);
    }
    animate();
} */

function initSPHBuffers(){
    let buffers = [4];
    for(let i = 0; i < 4; i++){
        buffers[i] = new THREE.WebGLRenderTarget(tex_size, tex_size,{
             minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
             format: THREE.RGBAFormat, type: THREE.FloatType
         });
    }
     return buffers;
}
function renderSPH(renderer, scene,camera,buffers){
    renderNeighbors(renderer, scene, camera, buffers[0]);
    renderDensity(renderer, scene, camera, buffers[1]);
    renderVelocity(renderer, scene, camera, buffers[2]);
    renderPositions(renderer, scene, camera, buffers[3]);
    scene.children[0].material.uniforms = uni[4];
    scene.children[0].material.vertexShader =  document.getElementById( 'sph-vs' ).textContent;
    scene.children[0].material.fragmentShader =  document.getElementById( 'sph-fs' ).textContent;
    scene.children[0].material.needsUpdate = true;
}

function renderNeighbors(renderer, scene, camera, neighbor_buff){
    scene.children[0].material.uniforms = uni[0];
    scene.children[0].material.vertexShader = document.getElementById( 'neigh-vs' ).textContent;
    scene.children[0].material.fragmentShader = document.getElementById( 'neigh-fs' ).textContent;
    scene.children[0].material.needsUpdate = true;
    renderer.render(scene, camera, neighbor_buff, true);
    renderer.readRenderTargetPixels(neighbor_buff, 0, 0, tex_size, tex_size, neighbor_tex.image.data)
    neighbor_tex.needsUpdate = true;
}

function renderDensity(renderer, scene, camera, density_buff){
    scene.children[0].material.uniforms = uni[1];
    scene.children[0].material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
    scene.children[0].material.fragmentShader =  document.getElementById( 'density-fs' ).textContent;
    scene.children[0].material.needsUpdate = true;
    renderer.render(scene, camera, density_buff, true);
    renderer.readRenderTargetPixels(density_buff, 0, 0, tex_size, tex_size, density_tex.image.data)
     density_tex.needsUpdate = true;
}

function renderVelocity(renderer, scene, camera, vel_buff){
    scene.children[0].material.uniforms = uni[2];
    scene.children[0].material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
    scene.children[0].material.fragmentShader =  document.getElementById( 'vel-fs' ).textContent;
    scene.children[0].material.needsUpdate = true;
    renderer.render(scene, camera, vel_buff);
    renderer.readRenderTargetPixels(vel_buff, 0, 0, tex_size, tex_size, vel_tex.image.data)
    vel_tex.needsUpdate = true;
}

function renderPositions(renderer, scene, camera, pos_buff){
    scene.children[0].material.uniforms = uni[3];
    scene.children[0].material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
    scene.children[0].material.fragmentShader =  document.getElementById( 'pos-fs' ).textContent;
    scene.children[0].material.needsUpdate = true;
    renderer.render(scene, camera, pos_buff, true);
    renderer.readRenderTargetPixels(pos_buff, 0, 0, tex_size, tex_size, pos_tex.image.data)
    pos_tex.needsUpdate = true;
}

function initUniforms(totalParticles, neighbors){
    let maxSearchRatio = 120.0;
    let volume = 1.0;
    let k_constant = 10.0; // nRT ideal gas
    let weightDefaultConstant = 315 / (64 * Math.PI * Math.pow(maxSearchRatio, 9));
    let weightPressureConstant = -45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    let weightViscosityConstant = 45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    let restDensity = 1000.0; // Kg/m3
    let particleMass = restDensity * volume / totalParticles;

    uni[0] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_grid_vol: {type: "f", value: grid_vol},
        u_grid_tex_size: {type: "f", value: tex_size}
    };
    uni[1] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type:"t", value: vel_tex},
        u_grid_vol: {type: "f", value: grid_vol},
        u_grid_tex_size: {type: "f", value: tex_size},
        u_mass: {type: "f", value: particleMass},
        u_maxSearchRatio: {type: "f", value: maxSearchRatio},
        u_weightDefaultConstant: {type: "f", value: weightDefaultConstant},
        u_neighbors: {type: "v3v", value: neighbors}
    };
    uni[2] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type:"t", value: vel_tex},
        u_density_tex: {type: "t", value: density_tex},
        u_neighbor_tex: {type: "t", value: neighbor_tex},
        u_grid_vol: {type: "f", value: grid_vol},
        u_grid_tex_size: {type: "f", value: tex_size},
        u_mass: {type: "f", value: particleMass},
        u_maxSearchRatio: {type: "f", value: maxSearchRatio},
        u_weightPressureConstant: {type: "f", value: weightPressureConstant},
        u_weightViscosityConstant: {type: "f", value: weightViscosityConstant},
        u_restDensity: {type: "f", value: restDensity},
        u_kConstant: {type: "f", value: k_constant},
        u_viscosity: {type: "f", value: 10.0},
        u_dt: {type: "f", value: 0.1},
        u_restitution: {type: "f", value: 1.0},
        u_neighbors: {type: "v3v", value: neighbors}
    };
    uni[3] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type: "t", value: vel_tex},
        u_grid_tex_size: {type: "f", value: tex_size},
        u_dt: {type: "f", value: 0.1}
    };
    uni[4] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type:"t", value: vel_tex},
        u_density_tex: {type: "t", value: density_tex},
        u_grid_tex_size: {type: "f", value: tex_size}
    };
}



function initPoints(neigh_vs, neigh_fs){
    let totalParticles = 0;
    let velocity = [];
    let position = [];
    let index = [];


    let center = 0.5;

    for(let i = 0; i < grid_vol; i++){
        for(let j = 0; j < grid_vol; j++){
            for(let k = 0; k < grid_vol; k++){
            //    position.push((k+center)/grid_vol,(j+center)/grid_vol, (i+center)/grid_vol );
                position.push((k+center),(j+center), (i+center),1.0 );
                velocity.push(0.0, 0.0, 0.0,1.0);
                totalParticles++;
                index.push(totalParticles);
            }
        }
    }
    for( let i = position.length; i < tex_size * tex_size * 4; i++){
        position.push(0.0);
        velocity.push(0.0);
        index.push(++totalParticles);
    }
    let neighbors = [];
	for (i = -1; i < 2; i++) {
		for (j = -1; j < 2; j++) {
			for (k = -1; k < 2; k++) {
				neighbors.push(new THREE.Vector3(i, j, k));
			}
		}
	}
    a = tex_size * tex_size * 4;
    let points = new Float32Array(position);
    let vellies = new Float32Array(velocity);
   pos_tex = new THREE.DataTexture(points, tex_size, tex_size, THREE.RGBAFormat, THREE.FloatType);
    pos_tex.needsUpdate = true;
    vel_tex = new THREE.DataTexture(vellies, tex_size, tex_size, THREE.RGBAFormat, THREE.FloatType);
    vel_tex.needsUpdate = true;
    density_tex = new THREE.DataTexture(new Float32Array(a), tex_size, tex_size, THREE.RGBAFormat, THREE.FloatType);
    density_tex.needsUpdate = true;
    neighbor_tex = new THREE.DataTexture(new Float32Array(a), tex_size, tex_size, THREE.RGBAFormat, THREE.FloatType);
    neighbor_tex.needsUpdate = true;

    initUniforms(totalParticles, neighbors);
    let sph_material = new THREE.ShaderMaterial({
        uniforms: uni[0],
        vertexShader: document.getElementById( 'neigh-vs' ).textContent,
        fragmentShader: document.getElementById( 'neigh-fs' ).textContent,
        depthTest: true,
        blending: THREE.AdditiveBlending
    });
    let geo = new THREE.BufferGeometry();
    geo.addAttribute('position', new THREE.BufferAttribute(points, 4));
    geo.addAttribute('velocity', new THREE.BufferAttribute(vellies, 4));
    geo.addAttribute('the_index', new THREE.BufferAttribute(new Float32Array(index), 1));
    let sph_points = new THREE.Points(geo, sph_material);
    return sph_points;

}
