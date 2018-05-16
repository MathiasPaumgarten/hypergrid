var remove  = require( "mout/array/remove" );

module.exports = function( currentGrowCube ) {

    var thread = {};
    var availableCubes = [];
    var shrinkableCubes = [];
    var currentShrinkCube = currentGrowCube;
    var isShrinking = false;

    function grow() {
        var next = currentGrowCube.getSuccessor();

        if ( next ) {

            next.add();
            availableCubes.push( currentGrowCube );
            currentGrowCube = next;

            return false;

        } else {

            while ( availableCubes.length ) {
                var subject = availableCubes.pop();

                currentGrowCube = subject.getSuccessor();

                if ( currentGrowCube ) {
                    currentGrowCube.add();
                    return false;
                }
            }
        }

        return true;
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

    function step() {
        var isComplete = grow();

        isShrinking && shrink();

        if ( ! isComplete ) {
            setTimeout( step, 100 );
        }
    }

    step();

    // setTimeout( () => isShrinking = true, 1000 );

    return thread;
};