var gulp       = require( "gulp" );
var babelify   = require( "babelify" );
var browserify = require( "browserify" );
var connect    = require( "gulp-connect" );
var pug        = require( "gulp-pug" );
var cssnano    = require( "gulp-cssnano" );
var compass    = require( "gulp-compass" );
var source     = require( "vinyl-source-stream" );
var buffer     = require( "vinyl-buffer" );

function onError( error ) {
    console.log( error );
    this.emit( "end" );
}

gulp.task( "scripts", function() {

    var bundler = browserify( "javascript/main.js", {
            debug: true
        } )
        .transform( babelify, {} )
        .on( "error", onError );

    return bundler.bundle()
        .on( "error", onError )
        .pipe( source( "main.js" ) )
        .pipe( buffer() )
        .pipe( gulp.dest( "public/javascripts/" ) );
} );

gulp.task( "connect", function() {
    connect.server( {
        root: "public"
    } );
} );

gulp.task( "assets", function() {
    gulp.src( [ "assets/**/*", "!assets/.gitkeep" ] )
        .pipe( gulp.dest( "public" ) );
} );

gulp.task( "pug", function() {
    gulp.src( "pug/*.pug" )
        .pipe( pug() )
        .pipe( gulp.dest( "public" ) );
} );

gulp.task( "watch", function() {
    gulp.watch( "javascript/**/*.js", [ "scripts" ] );
    gulp.watch( "pug/**/*.pug", [ "pug" ] );
    gulp.watch( "scss/**/*.scss", [ "scss" ] );
    gulp.watch( "assets/**", [ "assets" ] );
} );

gulp.task( "scss", function() {
    gulp.src( "scss/*.scss" )
        .pipe( compass( {
            css: "public/stylesheets",
            sass: "scss",
        } ) )
        .on( "error", onError )
        .pipe( cssnano() )
        .pipe( gulp.dest( "public/stylesheets" ) );
} );

gulp.task( "default", [ "scripts", "pug", "scss", "watch", "connect" ] );