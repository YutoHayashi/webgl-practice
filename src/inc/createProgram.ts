import getVertexShader from '~/inc/getVertexShader';
import getFragmentShader from '~/inc/getFragmentShader';
import { Locations } from '~/types';

export type ProgramWithLocations = {
    program: WebGLProgram;
    locations: Locations;
}

export default (
    context: WebGL2RenderingContext,
    vertexShaderString: string,
    fragmentShaderString: string
): ProgramWithLocations => {

    const gl = context;

    const program = gl.createProgram(  );
    if ( ! program ) {
        throw new Error( `Failed to create program.` );
    }

    const vertexShader = getVertexShader( gl, vertexShaderString );
    const fragmentShader = getFragmentShader( gl, fragmentShaderString );

    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );

    if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        throw new Error( `Could not initialize shaders.` );
    }

    gl.useProgram( program );

    const aVertexPosition = gl.getAttribLocation( program, 'aVertexPosition' );
    const aVertexNormal = gl.getAttribLocation( program, 'aVertexNormal' );
    const uProjectionMatrix = gl.getUniformLocation( program, 'uProjectionMatrix' ) as WebGLUniformLocation;
    const uModelViewMatrix = gl.getUniformLocation( program, 'uModelViewMatrix' ) as WebGLUniformLocation;
    const uModelColor = gl.getUniformLocation( program, 'uModelColor' ) as WebGLUniformLocation;
    const uLightPosition = gl.getUniformLocation( program, 'uLightPosition' ) as WebGLUniformLocation;
    const uLightDirection = gl.getUniformLocation( program, 'uLightDirection' ) as WebGLUniformLocation;
    const uLightAmbient = gl.getUniformLocation( program, 'uLightAmbient' ) as WebGLUniformLocation;
    const uLightDiffuse = gl.getUniformLocation( program, 'uLightDiffuse' ) as WebGLUniformLocation;
    const uLightSpecular = gl.getUniformLocation( program, 'uLightSpecular' ) as WebGLUniformLocation;
    const uMaterialDiffuse = gl.getUniformLocation( program, 'uMaterialDiffuse' ) as WebGLUniformLocation;
    const uMaterialAmbient = gl.getUniformLocation( program, 'uMaterialAmbient' ) as WebGLUniformLocation;
    const uMaterialSpecular = gl.getUniformLocation( program, 'uMaterialSpecular' ) as WebGLUniformLocation;
    const uNormalMatrix = gl.getUniformLocation( program, 'uNormalMatrix' ) as WebGLUniformLocation;
    const uShininess = gl.getUniformLocation( program, 'uShininess' ) as WebGLUniformLocation;

    const locations: Locations = {
        aVertexPosition,
        aVertexNormal,
        uProjectionMatrix,
        uModelViewMatrix,
        uModelColor,
        uLightPosition,
        uLightDirection,
        uLightAmbient,
        uLightDiffuse,
        uLightSpecular,
        uMaterialDiffuse,
        uMaterialAmbient,
        uMaterialSpecular,
        uNormalMatrix,
        uShininess
    };

    return {
        program,
        locations,
    };

};
