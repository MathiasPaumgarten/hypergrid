var THREE         = require( "three" );
var OrbitControls = require( "three-orbit-controls" )( THREE );
var grid          = require( "./collections/grid" );

var scene;
var camera;
var renderer;
var light;
var controls;
var currentGrowCube;
var currentShrinkCube;
var availableCubes = [];
var shrinkableCubes = [];
var isReducing = false;

function init() {
    scene = new THREE.Scene();

    var width = window.innerWidth;
    var height = window.innerHeight;

    // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
    camera.position.set(
        160,
        160,
        160
    );

    controls = new OrbitControls( camera );

    light = new THREE.PointLight( 0xffffff, 1, 0 );
    light.position.copy( camera.position );

    renderer = new THREE.WebGLRenderer( { canvas: document.getElementById( "canvas" ) } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio ? window.devicePixelRatio : 1 );

    scene.add( light );
    scene.add( new THREE.AmbientLight( { color: 0xffffff } ) );

    grid.init( 10, scene );

    currentGrowCube = grid.get( 0, 0, 0 );
    shrinkCube = currentGrowCube;

    currentGrowCube.add( scene );

    step();
    setTimeout( () => isReducing = true, 1000 );
}

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    grid.onEach( "update" );

    renderer.render( scene, camera );
}

function step() {
    var isComplete = grow();

    isReducing && shrink();

    if ( ! isComplete ) {
        setTimeout( step, 100 );
    }
}

function grow() {
    var next = currentGrowCube.getSuccessor();

    if ( next ) {

        next.add( scene );
        availableCubes.push( currentGrowCube );
        currentGrowCube = next;

        return false;

    } else {

        while ( availableCubes.length ) {
            var subject = availableCubes.pop();

            currentGrowCube = subject.getSuccessor();

            if ( currentGrowCube ) {
                currentGrowCube.add( scene );
                return false;
            }
        }
    }

    return true;
}

function shrink() {
    var index = availableCubes.indexOf( shrinkCube );
    var connections = shrinkCube.getConnections();

    if ( index > -1 ) {
        availableCubes.splice( index, 1 );
    }

    shrinkCube.remove( scene );

    if ( connections.length === 0 ) {

        if ( shrinkableCubes.length === 0 ) {
            console.log( "we're doneso" );
            return;
        }

        shrinkCube = shrinkableCubes.shift();

    } else if ( connections.length === 1 ) {

        shrinkCube = connections[ 0 ];

    } else {
        shrinkCube = connections.shift();

        do shrinkableCubes.push( connections.shift() );
        while ( connections.length > 0 );
    }

}


init();
animate();