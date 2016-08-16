precision highp float;

uniform float density;
uniform int time;
varying vec3 vNormal;
varying vec3 vEyeDirection;

const vec3 onColor = vec3( 28.0 / 255.0, 254.0 / 0.255, 1.0 );
const vec3 offColor = vec3( 1.0, 161.0 / 0.255, 0.0 );

void main() {

    float gridSize = density * 8.0;
    float circleSize = 2.0 * density;

    // vec2 center = fract( ( resolution * circleSize ) / ( gl_FragCoord.xy * circleSize ) );

    vec2 center = floor( gl_FragCoord.xy / gridSize ) * gridSize + ( gridSize / 2.0 );
    float distance = distance( center, gl_FragCoord.xy );
    float facing = dot( vNormal, vEyeDirection );
    float size = ( 1.0 - facing ) * circleSize;

    vec3 color = mix( onColor, offColor, step( size, distance ) );

    gl_FragColor = vec4( color, 1.0 );
}