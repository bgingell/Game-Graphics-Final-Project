// Brent Gingell
// bgingell@ucsc.edu
// smoothed particle hydrodynamics

function main(){
    var sph_vs = document.getElementById( 'sph-vs' ).textContent;
    var sph_fs = document.getElementById( 'sph-fs' ).textContent;

    let container = document.getElementById('container');
    let camera, scene, renderer;

    camera = new THREE.PerspectiveCamera(45.0,
                    window.innerWidth/window.innerHeight, .1, 1000);
    camera.position.z = 80;

    scene = new THREE.Scene();

    let sph_mesh = initMesh(sph_vs, sph_fs);
    scene.add(sph_mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    function animate(){
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

function initMesh(sph_vs, sph_fs){
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
                position.push((k+center)/grid_vol,(j+center)/grid_vol, (i+center)/grid_vol );
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
    let pos_tex = new THREE.DataTexture(position, 1024, 1024, THREE.RGBFormat);
    let vel_tex = new THREE.DataTexture(velocity, 1024, 1024, THREE.RGBFormat);
    let volume = 1.0;
    let k_constant = 5.0; // nRT ideal gas
	maxSearchRatio = maxSearchRatio / grid_vol;
	let weightDefaultConstant = 315 / (64 * Math.PI * Math.pow(maxSearchRatio, 9));
	let weightPressureConstant = -45 / (Math.PI * Math.pow(maxSearchRatio, 6));
	let weightViscosityConstant = 45 / (Math.PI * Math.pow(maxSearchRatio, 6));
	let restDensity = 998.29; // Kg/m3
	let particleMass = restDensity * volume / totalParticles;

    let uniforms = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type:"t", value: vel_tex},
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
    let geo = new THREE.BufferGeometry(points);
    let sph_mesh = new THREE.Mesh(geo, sph_material);
    return sph_mesh;

}
