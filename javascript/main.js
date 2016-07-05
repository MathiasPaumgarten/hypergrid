var THREE         = require( "three" );
var OrbitControls = require( "three-orbit-controls" )( THREE );
var grid          = require( "./collections/grid" );
var thread        = require( "./workers/thread" );

var scene;
var camera;
var renderer;
var light;
var controls;

function init() {
    scene = new THREE.Scene();

    var width = window.innerWidth;
    var height = window.innerHeight;

    // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
    camera.position.set( 160, 160, 160 );

    controls = new OrbitControls( camera );

    light = new THREE.PointLight( 0xffffff, 1, 0 );
    light.position.copy( camera.position );

    renderer = new THREE.WebGLRenderer( { canvas: document.getElementById( "canvas" ) } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio ? window.devicePixelRatio : 1 );

    scene.add( light );
    scene.add( new THREE.AmbientLight( { color: 0xffffff } ) );

    grid.init( 10, scene );

    thread( grid.get( 0, 0, 0 ) );
    thread( grid.get( 9, 9, 9 ) );

    window.addEventListener( "resize", onResize );
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    light.position.copy( camera.position );
    grid.onEach( "update" );

    renderer.render( scene, camera );
}

init();
animate();