 function initGodRayObjects( scene ){
    moon( scene );
    skyBox( scene );

 }

 function moon( scene ){

    var tex_vs = document.getElementById( 'texVS' ).textContent;
    var tex_fs = document.getElementById( 'texFS' ).textContent;

    var objTex = new THREE.TextureLoader().load( '/GodRays/Moon.png' );
    var uniforms2 = {
    tex: { type: "t", value: objTex  },
    };


    material3 = new THREE.RawShaderMaterial( {
    uniforms: uniforms2,
    vertexShader: tex_vs,
    fragmentShader: tex_fs,
    } );

    var loader = new THREE.OBJLoader(  );

    loader.load( '/GodRays/Moon.obj', function ( object ) {

    object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
        child.material = material3;
        }
     } );

    var s = 3;
    object.scale.set( s, s, s );
    object.position.x += 1.0;
    object.position.y -= 0.5;

    moon = object;
     scene.add( moon );
     } );

}

function skyBox( scene ){

    var sb_vs = document.getElementById( 'skyboxVS' ).textContent;
    var sb_fs = document.getElementById( 'skyboxFS' ).textContent;

    var cubeMap = new THREE.CubeTextureLoader()
    .setPath("./GodRays/skybox/")
    .load( [
        'posx.jpg',
        'negx.jpg',
        'posy.jpg',
        'negy.jpg',
        'posz.jpg',
        'negz.jpg'
    ] );

    var uniforms2 = { "tCube": { type: "t", value: cubeMap } };

    var material2 = new THREE.RawShaderMaterial( {
        uniforms: uniforms2,
        vertexShader: sb_vs,
        fragmentShader: sb_fs
    } );

    material2.depthWrite = false;
    material2.side = THREE.BackSide;

    var geometry2 = new THREE.BoxGeometry( 2000, 2000, 2000 );
    skyMesh = new THREE.Mesh( geometry2, material2 );
    scene.add( skyMesh );

}




//

function initPostprocessing( postprocessing, camera, scene, renderer, bgColor, sunColor ) {

    var height = window.innerHeight;

    postprocessing.scene = new THREE.Scene();

    postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  height / 2, height / - 2, -10000, 10000 );

    // cool to play around with
    postprocessing.camera.position.z = 100;

    postprocessing.scene.add( postprocessing.camera );

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

    var w = window.innerWidth / 4.0;
    var h = height / 4.0;
    postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
    postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

    // god-ray shaders

    var godraysGenShader = THREE.ShaderGodRays[ "godrays_generate" ];
    postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
    postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

        uniforms: postprocessing.godrayGenUniforms,
        vertexShader: godraysGenShader.vertexShader,
        fragmentShader: godraysGenShader.fragmentShader

    } );

    var godraysCombineShader = THREE.ShaderGodRays[ "godrays_combine" ];
    postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
    postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

        uniforms: postprocessing.godrayCombineUniforms,
        vertexShader: godraysCombineShader.vertexShader,
        fragmentShader: godraysCombineShader.fragmentShader

    } );

    var godraysFakeSunShader = THREE.ShaderGodRays[ "godrays_fake_sun" ];
    postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
    postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

        uniforms: postprocessing.godraysFakeSunUniforms,
        vertexShader: godraysFakeSunShader.vertexShader,
        fragmentShader: godraysFakeSunShader.fragmentShader

    } );

    postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
    postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

    // brightness, intensity

    // postprocessing.godrayCombineUniforms.fGodRayIntensity.value = .5;

    postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, height ), postprocessing.materialGodraysGenerate );
    postprocessing.quad.position.z = -9900;
    postprocessing.scene.add( postprocessing.quad );

}

function renderGodRays( postprocessing, camera, scene, renderer  ) {

    var time = Date.now() / 2000;
    var screenSpacePosition = new THREE.Vector3();
    var sunPosition = new THREE.Vector3( 0, 1000, -1000 );
    var orbitRadius = 200;
    var height = window.innerHeight;

    scene.children[2].rotation.y += time * 0.00000000005;


    scene.children[2].position.set(
    Math.cos(time) * orbitRadius,
    0,
    Math.sin(time) * orbitRadius
    );

    postprocessing.godrayCombineUniforms.fGodRayIntensity.value = options.GodRayIntensity;

    sunPosition.y = options.SunPositiony;
    sunPosition.x = options.SunPositionx;

    camera.lookAt( scene.position );

    if ( postprocessing.enabled ) {

        // Find the screenspace position of the sun

        screenSpacePosition.copy( sunPosition );


        screenSpacePosition.project(camera);

        // normalize to 0..1
        screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
        screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;

        // Give it to the god-ray and sun shaders

        postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
        postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

        postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
        postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

        // -- Draw sky and sun --

        // Clear colors and depths, will clear to sky color

        renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );


        var sunsqH = .74 * height; // 0.74 depends on extent of sun from shader
        var sunsqW = .74 * height; // both depend on height because sun is aspect-corrected

        screenSpacePosition.x *= window.innerWidth;
        screenSpacePosition.y *= height;

        renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
        renderer.setScissorTest( true );

        postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / height;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
        renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors );

        renderer.setScissorTest( false );

        // -- Draw scene objects --

        // Colors

        scene.overrideMaterial = null;
        renderer.render( scene, camera, postprocessing.rtTextureColors );

        // Depth

        allMeshes.forEach(function(mesh) {
            mesh.material = materialDepth;
        });

        renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

        allMeshes.forEach(function(mesh) {
            mesh.material = material1;
        });



        // -- Render god-rays --

        // Maximum length of god-rays (in texture space [],1]X[0,1])

        var filterLen = 1.0;

        // Samples taken by filter

        var TAPS_PER_PASS = 10.0;

        // pass 1 - render into first ping-pong target

        var pass = 1.0;
        var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureDepth;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

        renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2 );

        // pass 2 - render into second ping-pong target

        pass = 2.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays2;

        renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1  );

        // pass 3 - 1st RT

        pass = 3.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays1;

        renderer.render( postprocessing.scene, postprocessing.camera , postprocessing.rtTextureGodRays2  );

        // final pass - composite god-rays onto colors

        postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
        postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

        renderer.render( postprocessing.scene, postprocessing.camera );
        postprocessing.scene.overrideMaterial = null;

    } else {

        renderer.clear();
        renderer.render( scene, camera );

    }

}

function GUI(){

    var gui = new dat.GUI( { width: 500 } );

    options = {
        GodRayIntensity: .5,
        SunPositiony: 3000,
        SunPositionx: -1000,

    };

    gui.add( options, "GodRayIntensity", 0, 1 );
    gui.add( options, "SunPositiony", -10000, 10000 );
    gui.add( options, "SunPositionx", -10000, 10000 );
}
