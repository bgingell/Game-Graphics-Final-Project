
function createReflectiveSphere(radius, skyBoxPath) {

    var geometry = new THREE.SphereGeometry(radius, 32, 32);

    var skyBoxTex = new THREE.CubeTextureLoader().load(skyBoxPath);

    var shaderInput = {
        time: {type: "f", value: 0.0},
        skyBox: {type: "t", value: skyBoxTex }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: shaderInput,
        vertexShader: reflectiveVShader,
        fragmentShader: reflectiveFShader
    });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.Start = function () {
        mesh.position.z = -5;
    }

    mesh.Update = function() {
        // mesh.rotation.x += 0.01;
        mesh.material.uniforms.time.value += 0.05;
    }

    return mesh;
}
