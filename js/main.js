if (!Detector.webgl) Detector.addGetWebGLMessage();

var FLOOR = -250;

var container, stats;

var camera, scene, renderer;
var cameraCube, sceneCube, cubeTarget;

var mesh, zmesh, geometry;

var loader;

var directionalLight, pointLight;

var mouseX = 0,
    mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var textureCube;
var textureCube1;
var shardMaterial;
var shader;

(function(){
    var r = "textures/textureCube/";
    var urlArray = [];
    for(var j = 0; j<10; j++){
        var cube = [];
        for (var i = 0; i < 6; i++) {
            var string = j + ".jpg";
            cube.push(r + string);
        }
        urlArray.push(cube);
    }


    textureCubes = [];
    for(var i = 0; i < urlArray.length; i++){
        var textureCube = THREE.ImageUtils.loadTextureCube(urlArray[i], THREE.CubeRefractionMapping);
        textureCubes.push(textureCube);
    }
    materials = [];
    for(var i = 0; i < textureCubes.length; i++){
       var shardMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            envMap: textureCubes[i],
            refractionRatio: 0.67,
            reflectivity: 0.95
        });
       materials.push(shardMaterial);
       console.log(materials);
    }
    loader = new THREE.BinaryLoader(true);
    // document.body.appendChild(loader.statusDomElement);
    for(var i = 0; i < 2; i++){
    loader.load('models/glass-model.js', function(geometry, materials[i]) {
        createScene(geometry, materials[i]);
    });


        // loader.load('models/glass-model.js', function(geometry) {
        //     var s = 12.5;
        //     var z = -1000;
        //     var shardMesh = new THREE.Mesh(geometry, materials[0]);
        //     shardMesh.position.z = z;
        //     shardMesh.position.y = -600;
        //     shardMesh.scale.x = shardMesh.scale.y = shardMesh.scale.z = s;
        //     meshes.push(shardMesh);
        //     // scene.add(rotObj);
        //     // loader.statusDomElement.style.display = "none";
        // });
    }
        
    // for(var i = 0; i < meshes.length; i++){
    //     console.log(meshes);
    //     scene.add(meshes[i]);
    // }

})();
init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
    camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 100000);
    camera.position.z = 500;

    cameraCube = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
    cameraCube.position.z = 500;
    // cameraCube = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 100000 );


    scene = new THREE.Scene();
    sceneScreen = new THREE.Scene();
    sceneCube = new THREE.Scene();

    rttex = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat  })

    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);



    // textureCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping);
    // textureCube1 = THREE.ImageUtils.loadTextureCube(urls1, THREE.CubeRefractionMapping);

    // Skybox

    // shader = THREE.ShaderLib["cube"];
    shader = new THREE.ShaderMaterial({

        uniforms: { "tCube": { type: "t", value: null },
                    "tCube2": { type: "t", value: null },
                    "tFlip": { type: "f", value: - 1 },
                    "mixAmt": { type: "f", value: 0.5 },
                    "opacity": { type: "f", value: 0.0}},

        vertexShader: [

            "varying vec3 vWorldPosition;",

            THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

            "void main() {",

            "   vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            "   vWorldPosition = worldPosition.xyz;",

            "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

                THREE.ShaderChunk[ "logdepthbuf_vertex" ],

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform samplerCube tCube;",
            "uniform samplerCube tCube2;",
            "uniform float tFlip;",
            "uniform float mixAmt;",
            "uniform float opacity;",

            "varying vec3 vWorldPosition;",

            THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

            "void main() {",
            "   vec4 texCube = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
            "   vec4 texCube2 = textureCube( tCube2, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
            "   gl_FragColor = mix(texCube, texCube2, mixAmt);",

                THREE.ShaderChunk[ "logdepthbuf_fragment" ],

            "}"

        ].join("\n")

    });
    shader.uniforms["tCube"].value = textureCubes[0];
    shader.uniforms["tCube2"].value = textureCubes[1];
    shader.uniforms["mixAmt"].value = 0.0;

    var material = new THREE.ShaderMaterial({

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        side: THREE.BackSide

    });
    // shardMaterial = new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     envMap: textureCubes[0],
    //     refractionRatio: 0.67,
    //     reflectivity: 0.95
    // })
    shardShader = new THREE.ShaderMaterial({

    });

    screenMaterial = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { type: "t", value: rttex } },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,

        depthWrite: false
    })


    // var material = new THREE.MeshBasicMaterial({map:});


    skymesh = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), material);
    sceneCube.add(skymesh);
    var plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    quad = new THREE.Mesh( plane, screenMaterial );
    quad.position.z = -100;
    sceneScreen.add( quad );

    renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    // renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    // contpearlsdChild( stats.domElement );

    // loader = new THREE.BinaryLoader(true);
    // document.body.appendChild(loader.statusDomElement);

    // loader.load('models/glass-model.js', function(geometry) {
    //     createScene(geometry, shardMaterial)
    // });

    // var sphereGeometry = new THREE.SphereGeometry(30,30,30);
    // createScene(sphereGeometry);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    //

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown, false);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    cameraCube.aspect = window.innerWidth / window.innerHeight;
    cameraCube.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function createScene(geometry, material) {
    // var s = 12.5;
    var s = 12.5*(Math.random(10,20));
    console.log(s);
    var z = -1000;
    rotObj = new THREE.Object3D();
    var shardMesh = new THREE.Mesh(geometry, material);
    shardMesh.position.z = z;
    shardMesh.position.y = -600;
    shardMesh.scale.x = shardMesh.scale.y = shardMesh.scale.z = s;
    // meshes.push(shardMesh);
    scene.add(shardMesh);
    loader.statusDomElement.style.display = "none";

}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) * 0.25;
    mouseY = (event.clientY - windowHalfY) * 0.25;

}

function onKeyDown(event) {
    if (event.keyCode == "32") {
        screenshot();

        function screenshot() {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);

            }
        }
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
}


function animate() {
    requestAnimationFrame(animate);
    render();
}
var timer = 0;
var counter = 0;
function render() {
    // var timer = -0.0002 * Date.now();
    timer++;
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;

    camera.lookAt(scene.position);
    // console.log(timer);
    if(timer%50 == 0 ){
        // shardMaterial.envMap = textureCubes[counter];
        // shader.uniforms["tCube"].value = textureCubes[counter];
        // shader.uniforms["opacity"].value = 0.0;

        counter++;
    }
    // if(counter){
        
    // } else{
    //     shardMaterial.envMap = textureCubes[0];
    //     shader.uniforms["tCube"].value = textureCubes[0];
    // }
    renderer.render(sceneCube, cameraCube, rttex, true);
    renderer.render(sceneScreen, cameraCube);
    renderer.render(scene, camera);

}