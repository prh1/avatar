// Simple three.js scene
var scene = new THREE.Scene();

var container = document.getElementById("scene");
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var pinkMaterial = new THREE.MeshPhongMaterial( { color: 0x506289, emissive: 0x572534 } );
var cube = new THREE.Mesh(new THREE.BoxGeometry( 100, 100, 100 ), pinkMaterial );
cube.rotation.x = 2;
cube.rotation.z = 2;
scene.add(cube);

var blueMaterial = new THREE.MeshPhongMaterial( { color: 0x056289, emissive: 0x072534 } );
var sphere = new THREE.Mesh(new THREE.SphereGeometry( 80, 32, 32 ), blueMaterial );
sphere.position.x = 160;
scene.add(sphere);

var yellowMaterial = new THREE.MeshPhongMaterial( { color: 0x888420, emissive: 0x888820 } );
var torus = new THREE.Mesh(new THREE.TorusGeometry( 100, 20, 64, 64 ), yellowMaterial );
torus.position.x = -200;
torus.rotation.x = Math.PI / 4;

scene.add(torus);


var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 400;

var light = new THREE.PointLight( 0xffffff ); 
light.position.y = 100;
light.position.x = 100;
light.position.z = 50;
scene.add(light);

renderer.render(scene, camera);