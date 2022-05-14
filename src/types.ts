export type Locations = {

    aVertexPosition: number;
    aVertexNormal: number;

    uShininess: WebGLUniformLocation;
    uProjectionMatrix: WebGLUniformLocation;

    uModelViewMatrix: WebGLUniformLocation;
    uModelColor: WebGLUniformLocation;

    uLightPosition: WebGLUniformLocation;
    uLightDirection: WebGLUniformLocation;
    uLightAmbient: WebGLUniformLocation;
    uLightDiffuse: WebGLUniformLocation;
    uLightSpecular: WebGLUniformLocation;

    uMaterialDiffuse: WebGLUniformLocation;
    uMaterialAmbient: WebGLUniformLocation;
    uMaterialSpecular: WebGLUniformLocation;

    uNormalMatrix: WebGLUniformLocation;

}
