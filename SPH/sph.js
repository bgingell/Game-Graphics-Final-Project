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
    camera.position.z = 5;

    scene = new THREE.Scene();

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
