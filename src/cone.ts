import getVertexShader from '~/inc/getVertexShader';
import getCanvasElement from '~/inc/getCanvasElement';
import initWebGL2RenderingContext from '~/inc/initWebGL2RenderingContext';
import getFragmentShader from '~/inc/getFragmentShader';
import createProgram from '~/inc/createProgram';
import autoResizeCanvas from '~/inc/autoResizeCanvas';
import * as matrix from 'gl-matrix'; // 行列オブジェクト

import vert from '~/shaders/main.vert';
import frag from '~/shaders/main.frag';

import { Program } from '~/types';

import coneModel from '~/models/geometries/cone1.json';

export default (  ) => {

    let canvas: HTMLCanvasElement;
    let gl: WebGL2RenderingContext;
    let program: Program;
    let coneVAO: WebGLVertexArrayObject | null;
    let modelIndexBuffer: WebGLBuffer | null;
    let projectionMatrix = matrix.mat4.create(  );
    let modelViewMatrix = matrix.mat4.create(  );
    let model: typeof coneModel;

    const initProgram = (  ) => {

        program = createProgram( gl );

        gl.attachShader( program, getVertexShader( gl, vert ) );
        gl.attachShader( program, getFragmentShader( gl, frag ) );
        gl.linkProgram( program );

        if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            console.error( 'Could not initialize shaders' );
        }

        gl.useProgram( program );

        program.aVertexPosition = gl.getAttribLocation( program, 'aVertexPosition' );
        program.uProjectionMatrix = gl.getUniformLocation( program, 'uProjectionMatrix' );
        program.uModelViewMatrix = gl.getUniformLocation( program, 'uModelViewMatrix' );
        program.uModelColor = gl.getUniformLocation( program, 'uModelColor' );

        console.log( program );

    };

    const initBuffer = (  ) => {

        model = coneModel;
        coneVAO = gl.createVertexArray(  );

        gl.bindVertexArray( coneVAO );

        // Set uniform color
        gl.uniform3fv( program.uModelColor, model.color );

        const modelVertexBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, modelVertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( model.vertices ), gl.STATIC_DRAW );

        // Configure instructions from VAO
        gl.enableVertexAttribArray( program.aVertexPosition );
        gl.vertexAttribPointer( program.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

        modelIndexBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( model.indices ), gl.STATIC_DRAW );

        // Clean
        gl.bindVertexArray( null );

    };

    const draw = (  ) => {

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

        // We will cover these operations in later chapters
        matrix.mat4.perspective( projectionMatrix, 45, gl.canvas.width / gl.canvas.height, .1, 10000 );
        matrix.mat4.identity( modelViewMatrix );
        matrix.mat4.translate( modelViewMatrix, modelViewMatrix, [ 0, 0, -5.0 ] );

        gl.uniformMatrix4fv( program.uProjectionMatrix, false, projectionMatrix );
        gl.uniformMatrix4fv( program.uModelViewMatrix, false, modelViewMatrix );

        // Bind
        gl.bindVertexArray( coneVAO );

        // Draw
        gl.drawElements( gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0 );

        // Clean
        gl.bindVertexArray( null );

    };

    const render = (  ) => {

        draw(  );
        requestAnimationFrame( render );

    };

    const init = (  ) => {

        canvas = getCanvasElement( 'canvas3d' );
        autoResizeCanvas( canvas );
        gl = initWebGL2RenderingContext( canvas );
        gl.clearColor( 0, 0, 0, 1 );
        initProgram(  );
        initBuffer(  );
        render(  );

    };

    window.onload = init;

};
