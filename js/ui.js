var container;
var scene, camera, renderer;
var loader;
var shards = [];
var shardTextures = [];
var textureCubes = [];
var materials = [];
var uiComponents;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX = 0; 
var mouseY = 0;
var index = 0;
var texture;
initScene();
function initScene(){
	container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 1, 100000);
    // camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);

	// camera.position.z = 500;
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: false});
	renderer.setSize(w,h);
	renderer.setClearColor(0xffffff,1);
	container.appendChild(renderer.domElement);
	//event listeners
	// document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	// window.addEventListener('resize', onWindowResize, false);
	texture = initTexture(index);
	// shardTexs();
	// for(var i = 0; i < 54; i++){
	// 	SHARD_ME(i);
	// }
	animate();
}
// function shardTexs(){
// 	for(var j = 0; j < 56; j++){
// 		var urls= [];
// 		for (var i = 0; i < 6; i++) {
// 	        var url = "textures/diamonds/diamond" + (i+1) + ".jpg";
// 	        // var url = "textures/textureCube/" + (i+1) + ".jpg";
// 	        urls.push(url);
// 	    }
// 	    var texture = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping);
// 	    shardTextures.push(texture);
// 	}
// }
// var texture = initTexture(index);

function SHARD_ME(texture){
	// var texture = initTexture(index);
	for(var index = 0; index<55; index++){
			initMaterial(index, texture);

	}
	// var material = initMaterial(index, shardTextures[index]);
}
function initTexture(index){
	var urls = [];
	for (var i = 0; i < 6; i++) {
        // var url = "textures/diamonds/diamond" + (index+1) + ".jpg";
        // var url = "textures/textureCube/" + (index+1) + ".jpg";
        var url = "textures/textureCube/1.jpg";
        urls.push(url)
    }
    var texture = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping, function(t){
    	SHARD_ME(t);
    });
    // return texture;
}
function initMaterial(index, texture){
	var params = {
		color: 0xffffff,
		envMap: texture,
		refractionRatio: 0.3,
		reflectivity: 0.95
	}
	var material = new THREE.MeshBasicMaterial(params)
	// return material;
	loadShard(index, material);

}
function loadShard(index, material){
	loader = new THREE.BinaryLoader(true);
	if(material){
		loader.load("models/shards/"+(index+1)+".js", function(geometry){
			createShard(index, geometry, material);
		});
	}

}
function createShard(index, geometry, material){
	var shard = new THREE.Mesh(geometry, material);
	// var shard = new THREE.Mesh(boxGeom, material);
	// shard.position.set(0,0,-1000);
	// shard.position.set(Math.random()*1500.0 -1000.0,Math.random()*1500.0 -1000.0,-1000);
	shard.position.set(200*(index%8)-600,90*(index/7)-340,-1000);
	var scale = 5000.0;
	shard.scale.set(scale,scale,scale);
	scene.add(shard);
	shards.push(shard);
}
function checkViewport(shard){

}
function onDocumentMouseDown(){
	// shards[index-1].material.dispose();
	// shards[index-1].geometry.dispose();
	// scene.remove(shards[index]);
	// index++;
	// SHARD_ME(index);
	// texture.envMap = load
}
function animate(){
	requestAnimationFrame(animate);
    render();
}
function render(){
	camera.lookAt(scene.position);
	if(index == 56){
		index = 0;
	}
	for(var i = 0; i < shards.length; i++){
		shards[i].rotation.x = Date.now()*0.00003;
		shards[i].rotation.y = Date.now()*0.00003;
		shards[i].rotation.z = Date.now()*0.00003;
	}	
	renderer.render(scene, camera);
}