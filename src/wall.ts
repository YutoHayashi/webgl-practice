import { mat4 } from 'gl-matrix';

import vert from '~/shaders/lambertReflection_based_glowShading/main.vert';
import frag from '~/shaders/lambertReflection_based_glowShading/main.frag';
import { Program } from '~/types';

import createProgram from '~/inc/createProgram';
import getVertexShader from '~/inc/getVertexShader';
import getFragmentShader from '~/inc/getFragmentShader';
import getCanvasElement from './inc/getCanvasElement';
import autoResizeCanvas from './inc/autoResizeCanvas';
import initWebGL2RenderingContext from './inc/initWebGL2RenderingContext';
import calculateNormal from './inc/calculateNormal';

export default (  ) => {

    let gl: WebGL2RenderingContext;
    let program: Program;
    let vao: WebGLVertexArrayObject | null;
    let indices: Array<number>;
    let indicesBuffer: WebGLBuffer | null;
    let azimuth: number = 0;
    let elevation: number = 0;
    const modelViewMatrix = mat4.create(  );
    const projectionMatrix = mat4.create(  );
    const normalMatrix = mat4.create(  );

    const initProgram = (  ) => {

        // Configure `canvas`
        const canvas = getCanvasElement( `canvas3d` );
        autoResizeCanvas( canvas );

        // Configure `gl`
        gl = initWebGL2RenderingContext( canvas );
        gl.clearColor( .9, .9, .9, 1.0 );
        gl.clearDepth( 100 );
        gl.enable( gl.DEPTH_TEST );
        gl.depthFunc( gl.LEQUAL );

        // Shader source
        const vertexShander = getVertexShader( gl, vert );
        const fragmentShander = getFragmentShader( gl, frag );

        // Configure `program`
        program = createProgram( gl );

        gl.attachShader( program, vertexShander );
        gl.attachShader( program, fragmentShander );
        gl.linkProgram( program );

        if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            console.error( 'Could not initialize shaders' );
        }

        gl.useProgram( program );

        // Set locations onto `program` instance
        program.aVertexPosition = gl.getAttribLocation( program, `aVertexPosition` );
        program.aVertexNormal = gl.getAttribLocation( program, `aVertexNormal` );
        program.uProjectionMatrix = gl.getUniformLocation( program, `uProjectionMatrix` ) as WebGLUniformLocation;
        program.uModelViewMatrix = gl.getUniformLocation( program, `uModelViewMatrix` ) as WebGLUniformLocation;
        program.uNormalMatrix = gl.getUniformLocation( program, `uNormalMatrix` ) as WebGLUniformLocation;
        program.uLightDirection = gl.getUniformLocation( program, `uLightDirection` ) as WebGLUniformLocation;
        program.uLightAmbient = gl.getUniformLocation( program, `uLightAmbient` ) as WebGLUniformLocation;
        program.uLightDiffuse = gl.getUniformLocation( program, `uLightDiffuse` ) as WebGLUniformLocation;
        program.uMaterialDiffuse = gl.getUniformLocation( program, `uMaterialDiffuse` ) as WebGLUniformLocation;

    };

    // Configure lights
    const initLights = (  ) => {

        gl.uniform3fv( program.uLightDirection, [ 0, 0, -1 ] );
        gl.uniform4fv( program.uLightAmbient, [ .01, .01, .01, 1.00 ] );
        gl.uniform4fv( program.uLightDiffuse, [ .5, .5, .5, 1.0 ] );
        gl.uniform4f( program.uMaterialDiffuse, .1, .5, .8, 1.0 );

    };

    const processKey = ( event: KeyboardEvent ) => {

        const lightDirection = gl.getUniform( program, program.uLightDirection );
        const incrementValue = 10;

        switch( event.keyCode ) {
            case 37: {
                azimuth -= incrementValue;
                break;
            }
            case 38: {
                elevation += incrementValue;
                break;
            }
            case 39: {
                azimuth += incrementValue;
                break;
            }
            case 40: {
                elevation -= incrementValue;
                break;
            }
        }

        azimuth %= 360;
        elevation %= 360;

        const theta = elevation * Math.PI / 180;
        const phi = azimuth * Math.PI / 180;

        //
        lightDirection[ 0 ] = Math.cos( theta ) * Math.sin( phi );
        lightDirection[ 1 ] = Math.sin( theta );
        lightDirection[ 2 ] = Math.cos( theta ) * -Math.cos( phi );

        gl.uniform3fv( program.uLightDirection, lightDirection );

    };

    /**
     * This function generates the example data and create the buffers
     *
     *           4          5             6         7
     *           +----------+-------------+---------+
     *           |          |             |         |
     *           |          |             |         |
     *           |          |             |         |
     *           |          |             |         |
     *           |          |             |         |
     *           +----------+-------------+---------+
     *           0          1             2         3
     * 
     */
    const initBuffers = (  ) => {

        const vertices = [
            -20, -8, 20, // 0
            -10, -8, 0,  // 1
            10, -8, 0,   // 2
            20, -8, 20,  // 3
            -20, 8, 20,  // 4
            -10, 8, 0,   // 5
            10, 8, 0,    // 6
            20, 8, 20    // 7
        ];

        indices = [
            0, 5, 4,
            1, 5, 0,
            1, 6, 5,
            2, 6, 1,
            2, 7, 6,
            3, 7, 2
        ];

        // Create VAO
        vao = gl.createVertexArray(  );

        // Bind VAO
        gl.bindVertexArray( vao );

        const normals = calculateNormal( vertices, indices );

        const verticesBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
        // Configure instructions
        gl.enableVertexAttribArray( program.aVertexPosition );
        gl.vertexAttribPointer( program.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

        const normalsBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, normalsBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );
        // Configure instructions
        gl.enableVertexAttribArray( program.aVertexNormal );
        gl.vertexAttribPointer( program.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

        indicesBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );

        // Clean
        gl.bindVertexArray( null );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

    };

    const draw = (  ) => {

        const { width, height } = gl.canvas;

        gl.viewport( 0, 0, width, height );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        mat4.perspective( projectionMatrix, 45, width / height, .1, 10000 );
        mat4.identity( modelViewMatrix );
        mat4.translate( modelViewMatrix, modelViewMatrix, [ 0, 0, -40 ] );

        mat4.copy( normalMatrix, modelViewMatrix );
        mat4.invert( normalMatrix, normalMatrix );
        mat4.transpose( normalMatrix, normalMatrix );

        gl.uniformMatrix4fv( program.uModelViewMatrix, false, modelViewMatrix );
        gl.uniformMatrix4fv( program.uProjectionMatrix, false, projectionMatrix );
        gl.uniformMatrix4fv( program.uNormalMatrix, false, normalMatrix );

        // We will start using the `try/catch` to capture any errors from our `draw` calls
        try {
            // Bind
            gl.bindVertexArray( vao );
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indicesBuffer );

            // Draw
            gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );

            // Clean
            gl.bindVertexArray( null );
            gl.bindBuffer( gl.ARRAY_BUFFER, null );
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
        }
        // We catch the `error` and simply output to the screen for testing/debugging purposes
        catch( error ) {
            console.error( error );
        }

    };

    const render = (  ) => {

        requestAnimationFrame( render );
        draw(  );

    };

    const init = (  ) => {

        initProgram(  );
        initBuffers(  );
        initLights(  );
        render(  );

    };

    window.onload = init;
    window.document.onkeydown = processKey;

};
