
function createBoxTexture(w, h, d, tex_path) {

    var size = new THREE.Vector3(w, h, d);
    var cube = new THREE.BoxGeometry(size.x, size.y, size.z);

    var tex = new THREE.TextureLoader().load(tex_path);
    var shaderInput = {
        size: {type: "v3", value: size},
        texture: { type: "t", value: tex }
    }

    var material = new THREE.ShaderMaterial({
        uniforms: shaderInput,
        vertexShader: texVShader,
        fragmentShader: texFShader
    });

    var mesh = new THREE.Mesh(cube, material)

    mesh.Start = function () {
        mesh.position.z = -5;
    }

    mesh.Update = function() {

        mesh.rotation.x += 0.05;
        mesh.rotation.y += 0.05;
        mesh.rotation.z += 0.05;
    }

    return mesh;
}
