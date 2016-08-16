varying vec3 vNormal;
varying vec3 vEyeDirection;

void main() {

    vec3 worldPosition = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;

    vNormal = normalize( normal );
    vEyeDirection = normalize( worldPosition - cameraPosition );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}