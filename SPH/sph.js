// Brent Gingell
// bgingell@ucsc.edu
// smoothed particle hydrodynamics
let pos_tex, vel_tex, density_tex, neighbor_tex;
let tex_size = 1024;
let grid_vol = 40;
let uni = [];

function main(){
    var neigh_vs = document.getElementById( 'neigh-vs' ).textContent;
    var neigh_fs = document.getElementById( 'neigh-fs' ).textContent;

    let container = document.getElementById('container');
    let camera, scene, renderer;

    camera = new THREE.PerspectiveCamera(45.0,
                    window.innerWidth/window.innerHeight, .1, 1000);
    camera.position.z = 80;
    let controls = new THREE.OrbitControls( camera );
    controls.update();

    scene = new THREE.Scene();

    let sph_points = initPoints(neigh_vs, neigh_fs);
    scene.add(sph_points);

    let cirmesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: "red"}));
    scene.add(cirmesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    if ( ! renderer.extensions.get( "OES_texture_float" ) ) {
        return "No OES_texture_float support for float textures.";
    }

/*    let tex_size = 1024;
    let density_buff = new THREE.WebGLRenderTarget(tex_size, tex_size,{
         minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
         format: THREE.RGBAFormat, type: THREE.FloatType
     });
    let vel_buff = new THREE.WebGLRenderTarget(tex_size, tex_size, {
         minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
         format: THREE.RGBAFormat, type: THREE.FloatType
     });
    let neighbor_buff = new THREE.WebGLRenderTarget(tex_size, tex_size,{
         minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
         format: THREE.RGBAFormat, type: THREE.FloatType
     });
    let pos_buff = new THREE.WebGLRenderTarget(tex_size, tex_size,{
         minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
         format: THREE.RGBAFormat, type: THREE.FloatType
     }); */
    function animate(){
        requestAnimationFrame(animate);
        // neighbors
    /*   renderer.render(scene, camera, neighbor_buff);
       neighbor_tex = neighbor_buff.texture;
       neighbor_tex.needsUpdate = true;
       sph_points.material.uniforms = uni[1];
       sph_points.material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
       sph_points.material.fragmentShader =  document.getElementById( 'density-fs' ).textContent;
       // density
       renderer.render(scene, camera, density_buff);
        density_tex = density_buff.texture;
        density_tex.needsUpdate = true;
        sph_points.material.uniforms = uni[2];
        sph_points.material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
        sph_points.material.fragmentShader =  document.getElementById( 'vel-fs' ).textContent;
        //velocity
        renderer.render(scene, camera, vel_buff);
        vel_tex = vel_buff.texture;
        vel_tex.needsUpdate = true;

        sph_points.material.uniforms = uni[3];
        sph_points.material.vertexShader =  document.getElementById( 'density-vel-pos-vs' ).textContent;
        sph_points.material.fragmentShader =  document.getElementById( 'pos-fs' ).textContent;
        // position
        renderer.render(scene, camera, pos_buff);
        pos_tex = pos_buff.texture;
        pos_tex.needsUpdate = true;
        sph_points.material.uniforms = uni[4];
        sph_points.material.vertexShader =  document.getElementById( 'sph-vs' ).textContent;
        sph_points.material.fragmentShader =  document.getElementById( 'sph-fs' ).textContent;
        sph_points.material.needsUpdate = true;
        // actual scene */
        renderer.render(scene, camera);
    //    sph_points.material.uniforms = uni[0];
    //    sph_points.material.vertexShader =  neigh_vs;
    //    sph_points.material.fragmentShader = neigh_fs;
    }
    animate();
}

function initUniforms(totalParticles, neighbors){
    let maxSearchRatio = 2.5;
    let volume = 1.0;
    let k_constant = 5.0; // nRT ideal gas
    maxSearchRatio = maxSearchRatio / grid_vol;
    let weightDefaultConstant = 315 / (64 * Math.PI * Math.pow(maxSearchRatio, 9));
    let weightPressureConstant = -45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    let weightViscosityConstant = 45 / (Math.PI * Math.pow(maxSearchRatio, 6));
    let restDensity = 998.29; // Kg/m3
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
        u_dt: {type: "f", value: 0.0},
        u_restitution: {type: "f", value: 0.1},
        u_neighbors: {type: "v3v", value: neighbors}
    };
    uni[3] = {
        u_pos_tex: {type: "t", value: pos_tex},
        u_vel_tex: {type: "t", value: vel_tex},
        u_grid_tex_size: {type: "f", value: tex_size},
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
                //position.push((k+center)/grid_vol,(j+center)/grid_vol, (i+center)/grid_vol );
                position.push((k+center),(j+center), (i+center),0 );
                velocity.push(0, 0, 0, 0);
                totalParticles++;
                index.push(totalParticles);
            }
        }
    }

    for( let i = position.length; i < tex_size * tex_size * 4; i++){
        position.push(0);
        velocity.push(0);
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
        vertexShader: document.getElementById( 'sph-vs' ).textContent,
        fragmentShader: document.getElementById( 'sph-fs' ).textContent,
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
