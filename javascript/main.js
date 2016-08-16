var THREE         = require( "three" );
var OrbitControls = require( "three-orbit-controls" )( THREE );
var grid          = require( "./collections/grid" );
var thread        = require( "./workers/thread" );

var scene;
var camera;
var renderer;
var light;
var controls;
var container;

function init() {
    scene = new THREE.Scene();

    var width = window.innerWidth;
    var height = window.innerHeight;

    // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 500 );
    camera.position.set( 160, 160, 160 );

    controls = new OrbitControls( camera );

    renderer = new THREE.WebGLRenderer( { canvas: document.getElementById( "canvas" ) } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio ? window.devicePixelRatio : 1 );
    renderer.setClearColor( 0xFFFFFF, 1 );

    container = grid.init( 10, scene );

    scene.add( container );

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

    container.rotation.y += 0.01;
    container.rotation.x += 0.01;

    requestAnimationFrame( animate );

    controls.update();
    grid.onEach( "update" );

    renderer.render( scene, camera );
}

init();
animate();