
function createSkyBox(size, texs_path) {

    var cube = new THREE.BoxGeometry(size, size, size);

    var tex = new THREE.CubeTextureLoader().load(texs_path);
    var shaderInput = {
        skyBox: { type: "t", value: tex }
    }

    var material = new THREE.ShaderMaterial({
        uniforms: shaderInput,
        vertexShader: texVShader,
        fragmentShader: skyBoxFShader
    });
    
    material.side = THREE.BackSide;

    var mesh = new THREE.Mesh(cube, material)

    mesh.Start = function () {
        // mesh.position.z = -5;
    }

    mesh.Update = function() {
        // mesh.rotation.x += 0.01;
        // mesh.rotation.y += 0.01;
        // mesh.rotation.z += 0.01;
    }

    return mesh;
}
