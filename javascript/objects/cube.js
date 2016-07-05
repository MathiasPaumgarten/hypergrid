var THREE   = require( "three" );
var shuffle = require( "mout/array/shuffle" );
var clamp   = require( "mout/math/clamp" );
var shaders = require( "./shaders" );

const WIDTH = 20;
const orientation = {
    FRONT:  0,
    FRONT_TOP: 1,
    FRONT_TOP_RIGHT: 2,
    FRONT_RIGHT: 3,
    FRONT_BOTTOM_RIGHT: 4,
    FRONT_BOTTOM: 5,
    FRONT_BOTTOM_LEFT: 6,
    FRONT_LEFT: 7,
    FRONT_TOP_LEFT: 8,

    BACK: 9,
    BACK_TOP: 10,
    BACK_TOP_RIGHT: 11,
    BACK_RIGHT: 12,
    BACK_BOTTOM_RIGHT: 13,
    BACK_BOTTOM: 14,
    BACK_BOTTOM_LEFT: 15,
    BACK_LEFT: 16,
    BACK_TOP_LEFT: 17,

    LEFT: 18,
    LEFT_TOP: 19,
    LEFT_TOP_RIGHT: 8,
    LEFT_RIGHT: 7,
    LEFT_BOTTOM_RIGHT: 6,
    LEFT_BOTTOM: 20,
    LEFT_BOTTOM_LEFT: 15,
    LEFT_LEFT: 16,
    LEFT_TOP_LEFT: 17,

    RIGHT:  21,
    RIGHT_TOP: 22,
    RIGHT_TOP_RIGHT: 11,
    RIGHT_RIGHT: 12,
    RIGHT_BOTTOM_RIGHT: 13,
    RIGHT_BOTTOM: 23,
    RIGHT_BOTTOM_LEFT: 4,
    RIGHT_LEFT: 3,
    RIGHT_TOP_LEFT: 2,

    TOP: 24,
    TOP_TOP: 10,
    TOP_TOP_RIGHT: 11,
    TOP_RIGHT: 22,
    TOP_BOTTOM_RIGHT: 2,
    TOP_BOTTOM: 1,
    TOP_BOTTOM_LEFT: 8,
    TOP_LEFT: 19,
    TOP_TOP_LEFT: 17,

    BOTTOM: 25,
    BOTTOM_TOP: 14,
    BOTTOM_TOP_RIGHT: 13,
    BOTTOM_RIGHT: 23,
    BOTTOM_BOTTOM_RIGHT: 4,
    BOTTOM_BOTTOM: 5,
    BOTTOM_BOTTOM_LEFT: 6,
    BOTTOM_LEFT: 20,
    BOTTOM_TOP_LEFT: 15
};

const DIRECTIONS = Object.keys( orientation );
const DIRECTIONS_LENGTH = DIRECTIONS.length;
const OPPOSITE = {
    "TOP": "BOTTOM",
    "BOTTOM": "TOP",
    "LEFT": "RIGHT",
    "RIGHT": "LEFT",
    "FRONT": "BACK",
    "BACK": "FRONT"
};

Object.freeze( orientation );
Object.freeze( DIRECTIONS );
Object.freeze( OPPOSITE );

var geometry = new THREE.CubeGeometry( WIDTH, WIDTH , WIDTH );
var material = new THREE.ShaderMaterial( {
    uniforms: {
        resolution: {
            type: "v2",
            value: (
                new THREE.Vector2(
                    window.innerWidth,
                    window.innerHeight
                )
            ).multiplyScalar( window.devicePixelRatio )
        }
    },

    vertexShader: shaders.vertex,
    fragmentShader: shaders.fragment
} );

module.exports = function( id, scene ) {
    var cube = {};
    var neighbors;
    var mainNeighbors;
    var isShown = false;
    var forceRound = false;
    var t = 0;
    var growFactor = 0.08;

    cube.mesh = new THREE.Mesh( geometry, material );

    cube.setPosition = function( x, y, z ) {
        cube.mesh.position.set( x, y, z );
    };

    cube.add = function() {
        scene.add( cube.mesh );

        forceRound = true;
        isShown = true;

        if ( growFactor < 0 ) growFactor *= -1;
    };

    cube.remove = function() {
        forceRound = true;

        if ( growFactor > 0 ) growFactor *= -1;
    };

    cube.update = function() {
        if ( ! forceRound && ! isShown ) return;

        t = clamp( t + growFactor, 0, 1 );

        cube.mesh.scale.set( t, t, t );

        if ( t < Math.abs( growFactor ) ) {
            isShown = false;
            scene.remove( cube.mesh );
        }
    };

    cube.setNeighbors = function( value ) {
        neighbors = value;

        mainNeighbors = [ "TOP", "BOTTOM", "LEFT", "RIGHT", "BACK", "FRONT" ]
            .map( name => ( { direction: name, cube: neighbors[ orientation[ name ] ] } ) )
            .filter( x => x.cube !== null );
    };

    cube.isShown = function() {
        return isShown;
    };

    cube.isFree = function( from ) {
        if ( isShown ) return false;

        var ignorableIndices = [];
        var i, direction, neighbor;

        for ( i = 0; i < DIRECTIONS_LENGTH; i++ ) {
            direction = DIRECTIONS[ i ];

            if ( direction.substr( 0, from.length ) === from ) {
                ignorableIndices.push( orientation[ direction ] );
            }
        }

        for ( i = 0; i < DIRECTIONS_LENGTH; i++ ) {

            neighbor = getNeighborByName( DIRECTIONS[ i ] );

            if ( ignorableIndices.indexOf( orientation[ DIRECTIONS[ i ] ] ) > -1 ) continue;
            if ( neighbor && neighbor.isShown() ) return false;
        }

        return true;
    };

    cube.getSuccessor = function() {

        mainNeighbors = shuffle( mainNeighbors );

        var neighbor;

        for ( var i = 0; i < mainNeighbors.length; i++ ) {

            neighbor = mainNeighbors[ i ];

            if ( neighbor.cube && neighbor.cube.isFree( OPPOSITE[ neighbor.direction ] ) ) {
                return neighbor.cube;
            }
        }

        return null;
    };

    cube.getConnections = function() {
        if ( ! isShown ) return [];

        var neighbor;
        var length = mainNeighbors.length;
        var results = [];

        for ( var i = 0; i < length; i++ ) {
            neighbor = mainNeighbors[ i ].cube;

            if ( neighbor.isShown() ) results.push( neighbor );
        }

        return results;
    };

    function getNeighborByName( name ) {
        return neighbors[ orientation[ name ] ];
    }

    return cube;
};

Object.defineProperty( module.exports, "WIDTH", {
    get: () => WIDTH
} );

Object.defineProperty( module.exports, "orientation", {
    get: () => orientation
} );