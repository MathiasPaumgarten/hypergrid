precision highp float;

uniform vec2 resolution;
varying vec3 vNormal;
varying vec3 vEyeDirection;

void main() {
    vec2 center = floor( gl_FragCoord.xy / 16.0 ) * 16.0 + 8.0;
    float distance = distance( center, gl_FragCoord.xy );
    float facing = dot( vNormal, vEyeDirection );
    float size = ( 1.0 - facing ) * 5.0;

    if ( distance > size ) discard;

    gl_FragColor = vec4( 1.0 );
}