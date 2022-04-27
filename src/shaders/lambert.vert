#version 300 es
precision mediump float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection;
uniform vec3 uLightDiffuse;
uniform vec3 uMaterialDiffuse;

in vec3 aVertexPosition;
in vec3 aVertexNormal;

out vec4 vVertexColor;

void main( void ) {
    vec3 N = normalize( vec3( uNormalMatrix * vec4( aVertexNormal, 1.0 ) ) );
    vec3 light = vec3( uModelViewMatrix * vec4( uLightDirection, 0.0 ) );
    vec3 L = normalize( light );
    float lambertTerm = dot( N, -L );
    vec3 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
    vVertexColor = vec4( Id, 1.0 );
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4( aVertexPosition, 1.0 );
}
