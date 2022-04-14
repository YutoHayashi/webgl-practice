import frag from '~/shaders/main.frag';
import vert from '~/shaders/main.vert';
import './style.scss';

type Program = WebGLProgram & {
    aVertexPosition: number;
}

let gl: WebGL2RenderingContext;
let program: Program;
let squareVertexBuffer: WebGLBuffer;

const getFragmentShader = ( shaderString: string ) => {
    const shader = gl.createShader( gl.FRAGMENT_SHADER ) as WebGLShader;
    gl.shaderSource( shader, shaderString );
    gl.compileShader( shader );
    if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
        throw new Error( gl.getShaderInfoLog( shader ) || undefined );
    }
    return shader;
};

const getVertexShader = ( shaderString: string ) => {
    const shader = gl.createShader( gl.VERTEX_SHADER ) as WebGLShader;
    gl.shaderSource( shader, shaderString );
    gl.compileShader( shader );
    if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
        throw new Error( gl.getShaderInfoLog( shader ) || undefined );
    }
    return shader;
};

const initProgram = (  ) => {
    const vertexShader = getVertexShader( vert );
    const fragmentShader = getFragmentShader( frag );
    program = gl.createProgram(  ) as Program;
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );
    if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        throw new Error( 'Could not initialize shaders' );
    }
    gl.useProgram( program );
    program.aVertexPosition = gl.getAttribLocation( program, 'aVertexPosition' );
}

const initBuffers = (  ) => {
    const vertices = [
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,

        -0.5, 0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
    ];
    squareVertexBuffer = gl.createBuffer(  ) as WebGLBuffer;
    gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );
}

const draw = (  ) => {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
    gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexBuffer );
    gl.vertexAttribPointer( program.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( program.aVertexPosition );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );
}

const init = (  ) => {
    const canvas = document.querySelector( '#canvas3d' ) as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl = canvas.getContext( 'webgl2' ) as WebGL2RenderingContext;
    gl.clearColor( 0, 0, 0, 1 );
    initProgram(  );
    initBuffers(  );
    draw(  );
}

window.onload = init;
