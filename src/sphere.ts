import { GUI } from 'dat.gui';
import { mat4 } from 'gl-matrix';

import autoResizeCanvas from '~/inc/autoResizeCanvas';
import createProgram from '~/inc/createProgram';
import getCanvasElement from '~/inc/getCanvasElement';
import getFragmentShader from '~/inc/getFragmentShader';
import getVertexShader from '~/inc/getVertexShader';
import initWebGL2RenderingContext from '~/inc/initWebGL2RenderingContext';
import linkProgram from '~/inc/linkProgram';
import calculateNormal from '~/inc/calculateNormal';
import initGuiController, { Props as GUIProps } from '~/inc/initGuiController';

import { Program } from '~/types';

import vert from '~/shaders/main.vert';
import frag from '~/shaders/main.frag';

import sphere from '~/models/geometries/sphere.json';

export default (  ) => {

    let canvas: HTMLCanvasElement;
    let gl: WebGL2RenderingContext;
    let program: Program;
    let sphereVAO: WebGLVertexArrayObject | null;
    let sphereIBO: WebGLBuffer | null;
    let gui: GUI;
    let lightDiffuseColor = [ 1, 1, 1 ];
    let lightDirection = [ 0, -1, -1 ];
    let sphereColor = [ 0.5, 0.8, 0.1 ];
    let projectionMatrix = mat4.create(  );
    let modelViewMatrix = mat4.create(  );
    let normalMatrix = mat4.create(  );
    let angle = 0;
    let lastTime: number;
    let indices: Array<number>;

    const initProgram = (  ) => {

        program = createProgram( gl );

        gl.attachShader( program, getVertexShader( gl, vert ) );
        gl.attachShader( program, getFragmentShader( gl, frag ) );

        program = linkProgram( gl, program );

        gl.useProgram( program );

        // Set locations onto the `program` instance.
        program.aVertexPosition = gl.getAttribLocation( program, 'aVertexPosition' );
        program.aVertexNormal = gl.getAttribLocation( program, 'aVertexNormal' );
        program.uProjectionMatrix = gl.getUniformLocation( program, 'uProjectionMatrix' );
        program.uModelViewMatrix = gl.getUniformLocation( program, 'uModelViewMatrix' );
        program.uNormalMatrix = gl.getUniformLocation( program, 'uNormalMatrix' );
        program.uMaterialDiffuse = gl.getUniformLocation( program, 'uMaterialDiffuse' );
        program.uLightDiffuse = gl.getUniformLocation( program, 'uLightDiffuse' );
        program.uLightDirection = gl.getUniformLocation( program, 'uLightDirection' );

    };

    const initLights = (  ) => {

        gl.uniform3fv( program.uLightDirection, lightDirection );
        gl.uniform3fv( program.uLightDiffuse, lightDiffuseColor );
        gl.uniform3fv( program.uMaterialDiffuse, sphereColor );

    };

    const initBuffers = (  ) => {

        // Inline vertices. In real applications, these are, generally, fetched from a remote server
        const vertices = sphere.vertices;
        // Inline indices.
        indices = sphere.indices;
        // Calculate the normals using the `calculateNormals` function.
        const normals = calculateNormal( vertices, indices );

        // Create VAO
        sphereVAO = gl.createVertexArray(  );

        // Bind VAO
        gl.bindVertexArray( sphereVAO );

        // Vertices
        const sphereVertexBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
        // Configure VAO instructions
        gl.enableVertexAttribArray( program.aVertexPosition );
        gl.vertexAttribPointer( program.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

        // Normals
        const sphereNormalBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );
        // Configure VAO instructions
        gl.enableVertexAttribArray( program.aVertexNormal );
        gl.vertexAttribPointer( program.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

        // Indices
        sphereIBO = gl.createBuffer(  );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, sphereIBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );

        // Clean
        gl.bindVertexArray( null );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

    };

    const animate = (  ) => {

        let timeNow = ( new Date(  ) ).getTime(  );
        if ( lastTime ) {
            const elapsed = timeNow - lastTime;
            angle += ( 90 * elapsed ) / 1000.0;
        }
        lastTime = timeNow;

    };

    const draw = (  ) => {

        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // We will discuss these operations in later chapter
        mat4.perspective( projectionMatrix, 45, gl.canvas.width / gl.canvas.height, .1, 10000 );
        mat4.identity( modelViewMatrix );
        mat4.translate( modelViewMatrix, modelViewMatrix, [ 0, 0, -1.5 ] );

        // New operation for rotating the Model-View matrix
        mat4.rotate( modelViewMatrix, modelViewMatrix, angle * Math.PI / 180, [ 0, 0, 1 ] /** 回転軸 */ );

        mat4.copy( normalMatrix, modelViewMatrix );
        mat4.invert( normalMatrix, normalMatrix );
        mat4.transpose( normalMatrix, normalMatrix );

        gl.uniformMatrix4fv( program.uModelViewMatrix, false, modelViewMatrix );
        gl.uniformMatrix4fv( program.uProjectionMatrix, false, projectionMatrix );
        gl.uniformMatrix4fv( program.uNormalMatrix, false, normalMatrix );

        // We will start using the 'try/catch' to capture any errors from our 'draw' calls
        try {

            // Bind
            gl.bindVertexArray( sphereVAO );
    
            // Draw
            gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
    
            // Clean
            gl.bindVertexArray( null );
            gl.bindBuffer( gl.ARRAY_BUFFER, null );
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

        } catch( e ) {
            console.error( e );
        }

    };

    const render = (  ) => {

        animate(  );
        draw(  );
        requestAnimationFrame( render );

    };

    const initControls = (  ) => {

        const denormalizeColor = ( color: Array<number> ) => color.map( c => c * 255 );
        const normalizeColor = ( color: Array<number> ) => color.map( c => c / 255 );

        gui = initGuiController(
            {
                width: 500,
            },
            {
                'Sphere Color': {
                    value: denormalizeColor( sphereColor ),
                    onChange: v => gl.uniform3fv( program.uMaterialDiffuse, normalizeColor( v ) ),
                },
                'Light Diffuse Color': {
                    value: denormalizeColor( lightDiffuseColor ),
                    onChange: v => gl.uniform3fv( program.uLightDiffuse, normalizeColor( v ) ),
                },
                ...[ 'Translate X', 'Translate Y', 'Translate Z' ].reduce(
                    ( prev: { [ propName: string ]: GUIProps; }, propName, i ) => {
                        prev[ propName ] = {
                            value: lightDirection[ i ],
                            min: -10,
                            max: 10,
                            step: -0.1,
                            onChange: ( v, state ) => {
                                console.log( state[ 'Translate X' ], state[ 'Translate Y' ], state[ 'Translate Z' ] );
                                gl.uniform3fv(
                                    program.uLightDirection,
                                    [
                                        -state[ 'Translate X' ],
                                        -state[ 'Translate Y' ],
                                        state[ 'Translate Z' ],
                                    ],
                                );
                            },
                        };
                        return prev;
                    },
                    {  }
                ),
            }
        );

    };

    const init = (  ) => {

        canvas = getCanvasElement( 'canvas3d' );
        gl = initWebGL2RenderingContext( canvas );
        autoResizeCanvas( canvas );
        gl.clearColor( .9, .9, .9, 1.0 );
        gl.enable( gl.DEPTH_TEST );
        initProgram(  );
        initLights(  );
        initBuffers(  );
        render(  );
        initControls(  );

    }

    window.onload = init;

};
