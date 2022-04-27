type Program = WebGLProgram & {
    aVertexPosition: number;
}

export default ( context: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader ): Program => {
    const program = context.createProgram(  ) as Program;
    context.attachShader( program, vertexShader );
    context.attachShader( program, fragmentShader );
    context.linkProgram( program );
    if ( ! context.getProgramParameter( program, context.LINK_STATUS ) ) {
        throw new Error( 'Could not initialize shaders' );
    }
    context.useProgram( program );
    program.aVertexPosition = context.getAttribLocation( program, 'aVertexPosition' );
    return program;
};
