
function createTriangleTexture(w, h, tex_path) {

    var size = new THREE.Vector3(w, h, 0.0);

    // Define a triangle using Geometry
    var geometry = new THREE.Geometry();

    geometry.vertices.push(
        new THREE.Vector3( -w*0.5,  h*0.5, 0 ),
        new THREE.Vector3( -w*0.5, -h*0.5, 0 ),
        new THREE.Vector3(  w*0.5, -h*0.5, 0 )
    );

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    geometry.faceVertexUvs[0].push([
        new THREE.Vector2( 1.0, 0.0),
        new THREE.Vector2( 0.0, 0.0),
        new THREE.Vector2( 0.0, 1.0),
    ]);

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

    var mesh = new THREE.Mesh(geometry, material)

    mesh.Start = function () {
        mesh.position.z = -5;
    }

    mesh.Update = function() {
    }

    return mesh;
}
