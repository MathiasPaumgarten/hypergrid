var THREE         = require( "three" );
var OrbitControls = require( "three-orbit-controls" )( THREE );
var remove        = require( "mout/array/remove" );
var grid          = require( "./collections/grid" );
var thread        = require( "./workers/thread" );

var scene;
var camera;
var renderer;
var light;
var controls;
var currentGrowCube;
var currentShrinkCube;
var availableCubes = [];
var shrinkableCubes = [];

function init() {
    scene = new THREE.Scene();

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    // camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
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

    currentShrinkCube = currentGrowCube;

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

function shrink() {
    if ( ! currentShrinkCube ) return;

    remove( availableCubes, currentShrinkCube );
    remove( shrinkableCubes, currentShrinkCube );

    if ( ! currentShrinkCube.isShown() ) {
        currentShrinkCube = getNextShrinkCube( [] );
        shrink();
        return;
    }

    currentShrinkCube.remove();

    var connections = currentShrinkCube.getConnections();

    currentShrinkCube = getNextShrinkCube( connections );
}

function getNextShrinkCube( connections ) {
    var next;

    if ( connections.length === 0 ) {

        if ( shrinkableCubes.length < 0 ) return;

        do next = shrinkableCubes.shift();
        while ( next && ! next.isShown() );

    } else if ( connections.length === 1 ) {

        next = connections[ 0 ];

    } else {

        next = connections.shift();

        do shrinkableCubes.unshift( connections.shift() );
        while ( connections.length > 0 );
    }

    return next;
}


init();
animate();