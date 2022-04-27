import { Program } from '~/types';

export default ( context: WebGL2RenderingContext, program: Program ): Program => {
    context.linkProgram( program );
    if ( ! context.getProgramParameter( program, context.LINK_STATUS ) ) {
        throw new Error( 'Could not link shader program' );
    }
    return program;
};
