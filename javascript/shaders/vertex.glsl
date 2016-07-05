varying vec3 vNormal;
varying vec3 vEyeDirection;

void main() {
    vNormal = normalize( normal );
    vEyeDirection = normalize( position - cameraPosition );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}