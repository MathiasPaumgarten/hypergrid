var THREE = require( "three" );
var shuffle = require( "mout/array/shuffle" );

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
    LEFT_TOP_RIGHT: 20,
    LEFT_RIGHT: 21,
    LEFT_BOTTOM_RIGHT: 22,
    LEFT_BOTTOM: 23,
    LEFT_BOTTOM_LEFT: 24,
    LEFT_LEFT: 25,
    LEFT_TOP_LEFT: 26,

    RIGHT:  27,
    RIGHT_TOP: 28,
    RIGHT_TOP_RIGHT: 29,
    RIGHT_RIGHT: 30,
    RIGHT_BOTTOM_RIGHT: 31,
    RIGHT_BOTTOM: 32,
    RIGHT_BOTTOM_LEFT: 33,
    RIGHT_LEFT: 34,
    RIGHT_TOP_LEFT: 35,

    TOP: 36,
    TOP_TOP: 37,
    TOP_TOP_RIGHT: 38,
    TOP_RIGHT: 39,
    TOP_BOTTOM_RIGHT: 40,
    TOP_BOTTOM: 41,
    TOP_BOTTOM_LEFT: 42,
    TOP_LEFT: 43,
    TOP_TOP_LEFT: 44,

    BOTTOM: 45,
    BOTTOM_TOP: 46,
    BOTTOM_TOP_RIGHT: 47,
    BOTTOM_RIGHT: 48,
    BOTTOM_BOTTOM_RIGHT: 49,
    BOTTOM_BOTTOM: 50,
    BOTTOM_BOTTOM_LEFT: 51,
    BOTTOM_LEFT: 52,
    BOTTOM_TOP_LEFT: 53
};

const DIRECTIONS = Object.keys( orientation );
const DIRECTIONS_LENGTH = DIRECTIONS.length;
const OPPOSITE = {
    "TOP": "BOTTOM",
    "BOTTOM": "TOP",
    "LEFT": "RIGHT",
    "RIGHT": "LEFT",
    "FRONT": "BACK",
    "BACK": "FONT"
};

Object.freeze( orientation );
Object.freeze( DIRECTIONS );
Object.freeze( OPPOSITE );

var geometry = new THREE.CubeGeometry( WIDTH, WIDTH , WIDTH );
var material = new THREE.MeshLambertMaterial( { color: 0x2194ce } );

module.exports = function( /* id */ ) {
    var cube = {};
    var neighbors;
    var mainNeighbors;
    var isShown = false;

    cube.mesh = new THREE.Mesh( geometry, material );

    cube.setPosition = function( x, y, z ) {
        cube.mesh.position.set( x, y, z );
    };

    cube.add = function( scene ) {
        scene.add( cube.mesh );
        isShown = true;
    };

    cube.remove = function( scene ) {
        scene.remove( cube.mesh );
        isShown = false;
    };

    cube.update = function() {
        if ( ! isShown ) return;
    };

    cube.setNeighbors = function( value ) {
        neighbors = value;

        mainNeighbors = [ "TOP", "BOTTOM", "LEFT", "RIGHT", "BACK", "FRONT" ]
            .map( name => ( { direction: name, cube: neighbors[ orientation[ name ] ] } ) )
            .filter( x => x.cube !== null );
    };

    cube.isAvailable = function() {
        return ! isShown;
    };

    cube.isFree = function( from ) {
        if ( isShown ) return false;

        var ignorables = [];
        var i, direction, neighbor;

        for ( i = 0; i < DIRECTIONS_LENGTH; i++ ) {
            direction = DIRECTIONS[ i ];

            if ( direction.substr( 0, from.length ) === from ) {
                neighbor = getNeighborByName( direction );
                if ( neighbor ) ignorables.push( neighbor );
            }
        }

        for ( i = 0; i < DIRECTIONS_LENGTH; i++ ) {

            neighbor = getNeighborByName( DIRECTIONS[ i ] );

            if ( ignorables.indexOf( neighbor ) > -1 ) continue;

            if ( neighbor && ! neighbor.isAvailable() ) return false;
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