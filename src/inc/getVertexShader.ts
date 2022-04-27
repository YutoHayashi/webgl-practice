export default ( context: WebGL2RenderingContext, shaderString: string ) => {
    const shader = context.createShader( context.VERTEX_SHADER ) as WebGLShader;
    context.shaderSource( shader, shaderString );
    context.compileShader( shader );
    if ( ! context.getShaderParameter( shader, context.COMPILE_STATUS ) ) {
        throw new Error( context.getShaderInfoLog( shader ) || undefined );
    }
    return shader;
};
