export default ( canvas: HTMLCanvasElement ): WebGL2RenderingContext => {
    const context = canvas.getContext( 'webgl2' ) as WebGL2RenderingContext | undefined;
    if ( ! context ) {
        throw new Error( 'Could not get webgl2 context.' );
    }
    return context;
};
