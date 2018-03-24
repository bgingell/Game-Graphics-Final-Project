
function createBoxColor(w, h, d) {

    var cube = new THREE.BoxGeometry(w, h, d);

    var shaderInput = {
        time: { type: "f", value: 0.0 }
    }

    var material = new THREE.ShaderMaterial({
        uniforms: shaderInput,
        vertexShader: vShader,
        fragmentShader: fShader
    });

    var mesh = new THREE.Mesh(cube, material)

    mesh.Start = function () {
        mesh.position.z = -5;
    }

    mesh.Update = function() {

        mesh.position.x += 0.05;
        mesh.material.uniforms.time.value += 0.05;
    }

    return mesh;
}
