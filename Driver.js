function main() {
    var camera, scene, renderer;
    var postprocessing = { enabled : true };
    var container;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var materialDepth;
    var projector = new THREE.Projector();
    var bgColor = 0x00def;
    var sunColor = 0xffee00;
    var height = window.innerHeight;

    container = document.createElement( 'container' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 100;
    camera.position.y = 20;

    var controls = new THREE.OrbitControls( camera );
    controls.update();

    scene = new THREE.Scene();

    let sph_points = initPoints();
    scene.add(sph_points);
    let sph_buffers = initSPHBuffers();

    let num_fireworks = 10;
    let fireworks = firework_main(scene, num_fireworks);

    initGodRayObjects( scene );

    allMeshes = [];

    GUI();

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        devicePixelRatio: 1
    });
    renderer.setSize( window.innerWidth, height );
    container.appendChild( renderer.domElement );

    if ( ! renderer.extensions.get( "OES_texture_float" ) ) {
        return "No OES_texture_float support for float textures.";
    }
    renderer.sortObjects = false;

    renderer.autoClear = false;
    renderer.setClearColor( bgColor, 1 );

    stats = new Stats();
    container.appendChild( stats.domElement );


    function animate() {

        requestAnimationFrame( animate );

        renderSPH(renderer, scene, camera, sph_buffers);
        renderFireworks(scene, fireworks);
        renderGodRays( postprocessing, camera, scene, renderer );
        stats.update();

     }

     initPostprocessing( postprocessing, camera, scene, renderer, bgColor, sunColor );
     animate();

}
