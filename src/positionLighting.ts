import { mat4 } from 'gl-matrix';
import { GUI } from 'dat.gui';

import autoResizeCanvas from '~/inc/autoResizeCanvas';
import getCanvasElement from '~/inc/getCanvasElement';
import initWebGL2RenderingContext from '~/inc/initWebGL2RenderingContext';
import createProgram from '~/inc/createProgram';
import { Locations } from '~/types';
import initGuiController, { Props as GUIProps } from './inc/initGuiController';
import calculateNormal from './inc/calculateNormal';
import normalizeColor from './inc/normalizeColor';

import plane from '~/models/geometries/plane.json';
import cone from '~/models/geometries/cone2.json';
import sphere1 from '~/models/geometries/sphere1.json'
import sphere2 from '~/models/geometries/sphere3.json';

import vert from '~/shaders/positionLighting_section/main.vert';
import frag from '~/shaders/positionLighting_section/main.frag';

export default (  ) => {

    let gl: WebGL2RenderingContext;
    let program: WebGLProgram;
    let locations: Locations;
    let lightPosition: [ number, number, number ] = [ 4.5, 3, 15 ];
    let shininess: number = 200;
    let gui: GUI;
    let objects: Array<{ VAO: WebGLVertexArrayObject | null; IBO: WebGLBuffer | null; alias: string; } & ( typeof plane | typeof cone | typeof sphere1 | typeof sphere2 )> = [  ];
    let lastTime: number = 0;
    let angle: number = 0;
    let modelViewMatrix = mat4.create(  );
    let projectionMatrix = mat4.create(  );
    let normalMatrix = mat4.create();
    let distance = -100;

    const boot = (  ) => {

        const canvas = getCanvasElement( 'canvas3d' );
        autoResizeCanvas( canvas );
        gl = initWebGL2RenderingContext( canvas );
        gl.clearColor( .9, .9, .9, 1.0 );
        gl.clearDepth( 100 );
        gl.enable( gl.DEPTH_TEST );
        gl.depthFunc( gl.LEQUAL );

    };

    const initProgram = (  ) => {

        const _ = createProgram( gl, vert, frag );
        program = _.program;
        locations = _.locations;

    };

    const initLights = (  ) => {

        gl.uniform3fv( locations.uLightPosition, lightPosition );
        gl.uniform4f( locations.uLightAmbient, 1, 1, 1, 1 );
        gl.uniform4f( locations.uLightDiffuse, 1, 1, 1, 1 );
        gl.uniform4f( locations.uLightSpecular, 1, 1, 1, 1 );
        gl.uniform4f( locations.uMaterialAmbient, 0.1, 0.1, 0.1, 1 );
        gl.uniform4f( locations.uMaterialDiffuse, 0.5, 0.8, 0.1, 1 );
        gl.uniform4f( locations.uMaterialSpecular, 0.6, 0.6, 0.6, 1 );
        gl.uniform1f( locations.uShininess, shininess );

    };

    const loadObject = ( obj: typeof plane | typeof cone | typeof sphere1 | typeof sphere2, alias: string ) => {

        // Configure VAO
        const VAO = gl.createVertexArray(  );
        gl.bindVertexArray( VAO );

        // Vertices
        const vertexBufferObject = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBufferObject );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( obj.vertices ), gl.STATIC_DRAW );
        // Configure instructions for VAO
        gl.enableVertexAttribArray( locations.aVertexPosition );
        gl.vertexAttribPointer( locations.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

        // Normals
        const normalsBufferObject = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, normalsBufferObject );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( calculateNormal( obj.vertices, obj.indices ) ), gl.STATIC_DRAW );
        // Configure instructions for VAO
        gl.enableVertexAttribArray( locations.aVertexNormal );
        gl.vertexAttribPointer( locations.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

        // Indices
        const IBO = gl.createBuffer(  );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( obj.indices ), gl.STATIC_DRAW );

        // Attach values to be able to reference for later drawing
        const object = {
            ...obj,
            VAO,
            IBO,
            alias,
        };

        // Push onto object for later reference
        objects.push( object );

        gl.bindVertexArray( VAO );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

    };

    const getObject = ( alias: string ) => {
        const result = objects.find( object => object.alias === alias );
        if ( ! result ) throw new Error( 'Could not find any object' );
        return result
    }

    const load = (  ) => {

        loadObject( plane, 'plane' );
        loadObject( cone, 'cone' );
        loadObject( sphere1, 'sphere' );
        loadObject( sphere2, 'light' );

    }

    const draw = (  ) => {

        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        mat4.perspective( projectionMatrix, 45, gl.canvas.width / gl.canvas.height, .1, 1000 );

        try {
            // Iterate over every object
            objects.forEach( object => {

                // We will cover these operations in later chapters
                mat4.identity( modelViewMatrix );
                mat4.translate( modelViewMatrix, modelViewMatrix, [ 0, 0, distance ] );
                mat4.rotate( modelViewMatrix, modelViewMatrix, 30 * Math.PI / 180, [ 1, 0, 0 ] );
                mat4.rotate( modelViewMatrix, modelViewMatrix, angle * Math.PI / 180, [ 0, 1, 0 ] );

                // If object is the light, we update its position
                if ( object.alias === 'light' ) {
                    const lightPosition = gl.getUniform( program, locations.uLightPosition );
                    mat4.translate( modelViewMatrix, modelViewMatrix, lightPosition );
                }

                mat4.copy( normalMatrix, modelViewMatrix );
                mat4.invert( normalMatrix, normalMatrix );
                mat4.transpose( normalMatrix, normalMatrix );

                gl.uniformMatrix4fv( locations.uModelViewMatrix, false, modelViewMatrix );
                gl.uniformMatrix4fv( locations.uProjectionMatrix, false, projectionMatrix );
                gl.uniformMatrix4fv( locations.uNormalMatrix, false, normalMatrix );

                // Set lighting data
                gl.uniform4fv( locations.uMaterialAmbient, object.ambient );
                gl.uniform4fv( locations.uMaterialDiffuse, object.diffuse );
                gl.uniform4fv( locations.uMaterialSpecular, object.specular );

                // Bind
                gl.bindVertexArray( object.VAO );
                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, object.IBO );

                // Draw
                gl.drawElements( gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0 );

                // Clean
                gl.bindVertexArray( null );
                gl.bindBuffer( gl.ARRAY_BUFFER, null );
                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

            } );
        } catch( error ) {
            console.error( error );
        }

    };

    const animate = (  ) => {

        const timeNow = ( new Date(  ) ).getTime(  );
        if ( lastTime ) {
            const elapsed = timeNow - lastTime;
            angle += ( 90 * elapsed ) / 10000.0;
        }
        lastTime = timeNow;

    }

    const render = (  ) => {

        draw(  );
        animate(  );
        requestAnimationFrame( render );

    };

    const initControls = (  ) => {

        gui = initGuiController(
            { width: 400, },
            {
                'Sphere Color': {
                    value: [ 0, 255, 0 ],
                    onChange: v => getObject( 'sphere' ).diffuse = [ ...normalizeColor( v ), 1.0 ],
                },
                'Cone Color': {
                    value: [ 235, 0, 210 ],
                    onChange: v => getObject( 'cone' ).diffuse = [ ...normalizeColor( v ), 1.0 ],
                },
                Shininess: {
                  value: shininess,
                  min: 1, max: 50, step: 0.1,
                  onChange: v => gl.uniform1f( locations.uShininess, v )
                },
                // Spread all values from the reduce onto the controls
                ...[ 'Translate X', 'Translate Y', 'Translate Z' ].reduce(
                    ( prev: { [ propName: string ]: GUIProps; }, propName, i ) => {
                        prev[ propName ] = {
                            value: lightPosition[ i ],
                            min: -50,
                            max: 50,
                            step: -0.1,
                            onChange: ( v, state ) => {
                                gl.uniform3fv(
                                    locations.uLightPosition,
                                    [
                                        state[ 'Translate X' ],
                                        state[ 'Translate Y' ],
                                        state[ 'Translate Z' ],
                                    ],
                                );
                            },
                        };
                        return prev;
                    },
                    {  }
                ),
                Distance: {
                    value: distance,
                    min: -200,
                    max: -50,
                    step: 0.1,
                    onChange: v => distance = v,
                },
            }
        );

    };

    const init = (  ) => {

        boot(  );
        initProgram(  );
        initLights(  );
        load(  );
        render(  );
        initControls(  );

    };

    window.onload = init;

};
