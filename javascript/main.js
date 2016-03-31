var THREE         = require( "three" );
var OrbitControls = require( "three-orbit-controls" )( THREE );
var grid          = require( "./collections/grid" );

var scene;
var camera;
var renderer;
var light;
var controls;
var currentCube;
var availableCubes = [];

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 300;

    controls = new OrbitControls( camera );

    light = new THREE.PointLight( 0xffffff, 1, 0 );
    light.position.z = 300;

    renderer = new THREE.WebGLRenderer( { canvas: document.getElementById( "canvas" ) } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene.add( light );
    scene.add( new THREE.AmbientLight( { color: 0xffffff } ) );

    grid.init( 5 );

    currentCube = grid.get( 0, 0, 0 );

    scene.add( currentCube.mesh );

    step();
}

function animate() {
    requestAnimationFrame( animate );

    light.position.copy( camera.position );
    controls.update();

    renderer.render( scene, camera );
}

function step() {
    var next = currentCube.getSuccessor();

    if ( next ) {
        next.add( scene );
        availableCubes.push( currentCube );
        currentCube = next;

        setTimeout( step, 200 );
    }
}

init();
animate();