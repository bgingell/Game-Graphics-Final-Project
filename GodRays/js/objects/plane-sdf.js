
function createPlaneSDF(w, h) {

    var geometry = new THREE.PlaneGeometry(w,h);

    var shaderInput = {
        resolution: {type: "f", value: new THREE.Vector2(w,h)}
    };

    var material = new THREE.ShaderMaterial({
        uniforms: shaderInput,
        vertexShader: sphereDFVShader,
        fragmentShader: sphereDFFShader
    });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.Start = function() {
    }

    mesh.Update = function() {
    }

    return mesh;
}
