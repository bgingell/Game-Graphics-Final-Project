
function main(){

    let container = document.getElementById('container');
    let camera, scene, renderer;

    camera = new THREE.PerspectiveCamera(45.0,
                    window.innerWidth/window.innerHeight, .1, 1000);
    camera.position.z = 80;
    let controls = new THREE.OrbitControls( camera );
    controls.update();

    scene = new THREE.Scene();

    let sph_points = initPoints();
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
    function animate(){
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

function initPoints(){
    let points = new Float32Array([
        1, 1, 1, 1,
        0, 0, 0, 1,
        2, 1, 3, 1,
        4, 1, 3, 1
    ]);
    let sph_material = new THREE.ShaderMaterial({
        vertexShader: document.getElementById( 'sph-vs' ).textContent,
        fragmentShader: document.getElementById( 'sph-fs' ).textContent,
        blending: THREE.AdditiveBlending
    })

    let geo = new THREE.BufferGeometry();
    geo.addAttribute('position', new THREE.BufferAttribute(points, 4));
    let sph_points = new THREE.Points(geo, sph_material);
    return sph_points;
}
