// Brent Gingell
// bgingell@ucsc.edu
// smoothed particle hydrodynamics
let pos_tex, vel_tex, density_tex, neighbor_tex;
function main(){
    var sph_vs = document.getElementById( 'sph-vs' ).textContent;
    var sph_fs = document.getElementById( 'sph-fs' ).textContent;

    let container = document.getElementById('container');
    let camera, scene, renderer;

    camera = new THREE.PerspectiveCamera(45.0,
                    window.innerWidth/window.innerHeight, .1, 1000);
    camera.position.z = 50;

    scene = new THREE.Scene();

    let sph_points = initPoints(sph_vs, sph_fs);
    scene.add(sph_points);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    let density_buff = new THREE.WebGLRenderTarget(1024, 1024,{ minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    let vel_buff = new THREE.WebGLRenderTarget(1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    let neighbor_buff = new THREE.WebGLRenderTarget(1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    let pos_buff = new THREE.WebGLRenderTarget(1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    function animate(){
        requestAnimationFrame(animate);
        // neighbors
        renderer.render(scene, camera, neighbor_buff);
        sph_points.material.uniforms.u_neighbor_tex.value = neighbor_buff.texture;
        sph_points.material.uniforms.u_step.value = 2;
        // density
        renderer.render(scene, camera, density_buff);
        sph_points.material.uniforms.u_density_tex.value = density_buff.texture;
        sph_points.material.uniforms.u_step.value = 3;
        //velocity
        renderer.render(scene, camera, vel_buff);
        sph_points.material.uniforms.u_vel_tex.value = vel_buff.texture;
        sph_points.material.uniforms.u_step.value = 4;
        // positions
        renderer.render(scene, camera, pos_buff);
        sph_points.material.uniforms.u_pos_tex.value = pos_buff.texture;
        sph_points.material.uniforms.u_step.value = 5;

        renderer.render(scene, camera);
        sph_points.material.uniforms.u_step.value = 1;
    }
    animate();
}

function initPoints(sph_vs, sph_fs){
    let grid_vol = 40;
    let totalParticles = 0;

    let velocity = [];
    let position = [];
    let index = [];

    let counter = 0;
    let center = 0.5;

    for(let i = 1; i < grid_vol - 1; i++){
        for(let j = 1; j < grid_vol - 1; j++){
            for(let k = 1; k < grid_vol - 1; k++){
                //position.push((k+center)/grid_vol,(j+center)/grid_vol, (i+center)/grid_vol );
                position.push((k+center),(j+center), (i+center) );
                velocity.push(0, 0, 0);
                totalParticles++;
                index.push(totalParticles);
            }
        }
    }
    let neighbors = [];
	for (i = -1; i < 2; i++) {
		for (j = -1; j < 2; j++) {
			for (k = -1; k < 2; k++) {
				neighbors.push(i, j, k);
			}
		}
	}
    let maxSearchRatio = 2.5;
    pos_tex = new THREE.DataTexture(position, 1024, 1024, THREE.RGBFormat);
    vel_tex = new THREE.DataTexture(velocity, 1024, 1024, THREE.RGBFormat);
    density_tex = new THREE.DataTexture(velocity, 1024, 1024, THREE.RGBFormat);
    neighbor_tex = new THREE.DataTexture(velocity, 1024, 1024, THREE.RGBFormat);
    let volume = 1.0;
    let k_constant = 5.0; // nRT ideal gas
	maxSearchRatio = maxSearchRatio / grid_vol;
	let weightDefaultConstant = 315 / (64 * Math.PI * Math.pow(maxSearchRatio, 9));
	let weightPressureConstant = -45 / (Math.PI * Math.pow(maxSearchRatio, 6));
	let weightViscosityConstant = 45 / (Math.PI * Math.pow(maxSearchRatio, 6));
	let restDensity = 998.29; // Kg/m3
	let particleMass = restDensity * volume / totalParticles;
    let uniforms = {
        u_step: {type: "i", value: 1},
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type:"t", value: vel_tex},
        u_density_tex: {type:"t", value: density_tex},
        u_neighbor_tex: {type:"t", value: neighbor_tex},
        u_grid_vol: {type: "f", value: grid_vol},
        u_grid_tex_size: {type: "f", value: 1024},
        u_particle_mass: {type: "f", value: particleMass},
        u_maxSearchRatio: {type: "f", value: maxSearchRatio},
        u_weightDefaultConstant: {type: "f", value: weightDefaultConstant},
        u_weightPressureConstant: {type: "f", value: weightPressureConstant},
        u_weightViscosityConstant: {type: "f", value: weightViscosityConstant},
        u_restDensity: {type: "f", value: restDensity},
        u_kConstant: {type: "f", value: k_constant},
        u_viscosity: {type: "f", value: 10.0},
        u_dt: {type: "f", value: 0.0},
        u_restitution: {type: "f", value: 0.1},
        u_neighbors: {type: "v3", value: neighbors}
    }
    let sph_material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: sph_vs,
        fragmentShader: sph_fs,
    });
    let points = new Float32Array(position);
    let geo = new THREE.BufferGeometry();
    geo.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geo.addAttribute('velocity', new THREE.BufferAttribute(new Float32Array(velocity)));
    let sph_points = new THREE.Points(geo, sph_material);
    return sph_points;

}
