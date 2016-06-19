module.exports = function( currentGrowCube ) {
    var thread = {};
    var availableCubes = [];

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

    function step() {
        var isComplete = grow();

        if ( ! isComplete ) {
            setTimeout( step, 100 );
        }
    }

    step();

    return thread;
};