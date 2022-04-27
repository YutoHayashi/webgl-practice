export type Program = WebGLProgram & {
    aVertexPosition: number;
    aVertexNormal: number;
    uProjectionMatrix: WebGLUniformLocation | null;
    uModelViewMatrix: WebGLUniformLocation | null;
    uModelColor: WebGLUniformLocation | null;
    uLightDirection: WebGLUniformLocation | null;
    uLightDiffuse: WebGLUniformLocation | null;
    uMaterialDiffuse: WebGLUniformLocation | null;
    uNormalMatrix: WebGLUniformLocation | null;
};
