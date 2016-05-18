var cube = require( "../objects/cube" );

var data;
var size = 0;
var orientation = cube.orientation;

exports.init = function ( length, scene ) {

    const offset = - Math.floor( length / 2 );

    var x, y, z;
    var index = 0;

    size = length;
    data = [];

    for ( x = 0; x < size; x++ ) {

        data[ x ] = [];

        for ( y = 0; y < size; y++ ) {

            data[ x ][ y ] = [];

            for ( z = 0; z < size; z++ ) {

                var object = data[ x ][ y ][ z ] = cube( index++, scene );

                object.setPosition(
                    ( offset + x ) * cube.WIDTH,
                    ( offset + y ) * cube.WIDTH,
                    ( offset + z ) * cube.WIDTH
                );
            }
        }
    }

    for ( x = 0; x < size; x++ )
    for ( y = 0; y < size; y++ )
    for ( z = 0; z < size; z++ ) {

        var neighbors = [];

        // More assignments than necessary. Ideally I have a better
        // system but let's not waste time for now.

        neighbors[ orientation.FRONT ]               = getSafe( x,     y,     z + 1 );
        neighbors[ orientation.FRONT_TOP ]           = getSafe( x,     y + 1, z + 1 );
        neighbors[ orientation.FRONT_TOP_RIGHT ]     = getSafe( x + 1, y + 1, z + 1 );
        neighbors[ orientation.FRONT_RIGHT ]         = getSafe( x + 1, y,     z + 1 );
        neighbors[ orientation.FRONT_BOTTOM_RIGHT ]  = getSafe( x + 1, y - 1, z + 1 );
        neighbors[ orientation.FRONT_BOTTOM ]        = getSafe( x,     y - 1, z + 1 );
        neighbors[ orientation.FRONT_BOTTOM_LEFT ]   = getSafe( x - 1, y - 1, z + 1 );
        neighbors[ orientation.FRONT_LEFT ]          = getSafe( x - 1, y,     z + 1 );
        neighbors[ orientation.FRONT_TOP_LEFT ]      = getSafe( x - 1, y + 1, z + 1 );

        neighbors[ orientation.BACK ]                = getSafe( x,     y,     z - 1 );
        neighbors[ orientation.BACK_TOP ]            = getSafe( x,     y + 1, z - 1 );
        neighbors[ orientation.BACK_TOP_RIGHT ]      = getSafe( x + 1, y + 1, z - 1 );
        neighbors[ orientation.BACK_RIGHT ]          = getSafe( x + 1, y,     z - 1 );
        neighbors[ orientation.BACK_BOTTOM_RIGHT ]   = getSafe( x + 1, y - 1, z - 1 );
        neighbors[ orientation.BACK_BOTTOM ]         = getSafe( x,     y - 1, z - 1 );
        neighbors[ orientation.BACK_BOTTOM_LEFT ]    = getSafe( x - 1, y - 1, z - 1 );
        neighbors[ orientation.BACK_LEFT ]           = getSafe( x - 1, y,     z - 1 );
        neighbors[ orientation.BACK_TOP_LEFT ]       = getSafe( x - 1, y + 1, z - 1 );

        neighbors[ orientation.LEFT ]                = getSafe( x - 1, y,     z     );
        neighbors[ orientation.LEFT_TOP ]            = getSafe( x - 1, y + 1, z     );
        neighbors[ orientation.LEFT_TOP_RIGHT ]      = getSafe( x - 1, y + 1, z + 1 );
        neighbors[ orientation.LEFT_RIGHT ]          = getSafe( x - 1, y,     z + 1 );
        neighbors[ orientation.LEFT_BOTTOM_RIGHT ]   = getSafe( x - 1, y - 1, z + 1 );
        neighbors[ orientation.LEFT_BOTTOM ]         = getSafe( x - 1, y - 1, z     );
        neighbors[ orientation.LEFT_BOTTOM_LEFT ]    = getSafe( x - 1, y - 1, z - 1 );
        neighbors[ orientation.LEFT_LEFT ]           = getSafe( x - 1, y,     z - 1 );
        neighbors[ orientation.LEFT_TOP_LEFT ]       = getSafe( x - 1, y + 1, z - 1 );

        neighbors[ orientation.RIGHT ]               = getSafe( x + 1, y,     z     );
        neighbors[ orientation.RIGHT_TOP ]           = getSafe( x + 1, y + 1, z     );
        neighbors[ orientation.RIGHT_TOP_RIGHT ]     = getSafe( x + 1, y + 1, z - 1 );
        neighbors[ orientation.RIGHT_RIGHT ]         = getSafe( x + 1, y,     z - 1 );
        neighbors[ orientation.RIGHT_BOTTOM_RIGHT ]  = getSafe( x + 1, y - 1, z - 1 );
        neighbors[ orientation.RIGHT_BOTTOM ]        = getSafe( x + 1, y - 1, z     );
        neighbors[ orientation.RIGHT_BOTTOM_LEFT ]   = getSafe( x + 1, y - 1, z + 1 );
        neighbors[ orientation.RIGHT_LEFT ]          = getSafe( x + 1, y,     z + 1 );
        neighbors[ orientation.RIGHT_TOP_LEFT ]      = getSafe( x + 1, y + 1, z + 1 );

        neighbors[ orientation.TOP ]                 = getSafe( x,     y + 1, z     );
        neighbors[ orientation.TOP_TOP ]             = getSafe( x,     y + 1, z - 1 );
        neighbors[ orientation.TOP_TOP_RIGHT ]       = getSafe( x + 1, y + 1, z - 1 );
        neighbors[ orientation.TOP_RIGHT ]           = getSafe( x + 1, y + 1, z     );
        neighbors[ orientation.TOP_BOTTOM_RIGHT ]    = getSafe( x + 1, y + 1, z + 1 );
        neighbors[ orientation.TOP_BOTTOM ]          = getSafe( x,     y + 1, z + 1 );
        neighbors[ orientation.TOP_BOTTOM_LEFT ]     = getSafe( x - 1, y + 1, z + 1 );
        neighbors[ orientation.TOP_LEFT ]            = getSafe( x - 1, y + 1, z     );
        neighbors[ orientation.TOP_TOP_LEFT ]        = getSafe( x - 1, y + 1, z - 1 );

        neighbors[ orientation.BOTTOM ]              = getSafe( x,     y - 1, z     );
        neighbors[ orientation.BOTTOM_TOP ]          = getSafe( x,     y - 1, z - 1 );
        neighbors[ orientation.BOTTOM_TOP_RIGHT ]    = getSafe( x + 1, y - 1, z - 1 );
        neighbors[ orientation.BOTTOM_RIGHT ]        = getSafe( x + 1, y - 1, z     );
        neighbors[ orientation.BOTTOM_BOTTOM_RIGHT ] = getSafe( x + 1, y - 1, z + 1 );
        neighbors[ orientation.BOTTOM_BOTTOM ]       = getSafe( x,     y - 1, z + 1 );
        neighbors[ orientation.BOTTOM_BOTTOM_LEFT ]  = getSafe( x - 1, y - 1, z + 1 );
        neighbors[ orientation.BOTTOM_LEFT ]         = getSafe( x - 1, y - 1, z     );
        neighbors[ orientation.BOTTOM_TOP_LEFT ]     = getSafe( x - 1, y - 1, z - 1 );

        data[ x ][ y ][ z ].setNeighbors( neighbors );

    }

};

function getSafe( x, y, z ) {
    var max = size - 1;

    if ( x > max || y > max || z > max ) return null;
    if ( x < 0 || y < 0 || z < 0 ) return null;

    return data[ x ][ y ][ z ];
}

exports.onEach = function( func ) {
    for ( var x = 0; x < size; x++ )
    for ( var y = 0; y < size; y++ )
    for ( var z = 0; z < size; z++ ) {
        data[ x ][ y ][ z ][ func ]();
    }
};

exports.forEach = function( callback ) {
    for ( var x = 0; x < size; x++ )
    for ( var y = 0; y < size; y++ )
    for ( var z = 0; z < size; z++ ) {
        callback( data[ x ][ y ][ z ] );
    }
};

exports.get = function( x, y, z ) {
    return data[ x ][ y ][ z ];
};
