import { Program } from '~/types';

export default ( context: WebGL2RenderingContext ): Program => {
    const program = context.createProgram(  ) as Program;
    if ( ! program ) {
        throw new Error( 'Could not create webgl program.' );
    }
    return program;
}
