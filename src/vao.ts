/**
 * 頂点シェーダー
 * 
 * 頂点アトリビュートの計算
 * 座標に応じてこの関数はポイントやライン、トライアングルを含む多彩なプリミティブのラスタライズに必要な値を出力する
 * その他と、二つ目のユーザー定義関数、フラグメントシェーダーがこれらのプリミティブをラスタライズするために呼び出される。
 * 頂点座標や法線、色、テクスチャ座標などの頂点ごとのデータを操作する
 * これらのデータは頂点シェーダー内ではアトリビュートとして扱われる
 * それぞれのアトリビュートは頂点データ読み取るVBOと関連づけられている
 */
import vert from '~/shaders/main.vert';
/**
 * フラグメントシェーダー
 * 
 * フラグメントとは表面の各要素のこと
 * 三つの頂点を組み合わせると必ずトライアングルになる
 * このトライアングルの表面全体に色を設定しなければいけない
 * それぞれのピクセルの色を計算することが主な目的
 */
import frag from '~/shaders/main.frag';
/**
 * 頂点シェーダーとフラグメントシェーダーを合わせてプログラムという
 */
import './style.scss';

import getFragmentShader from '~/inc/getFragmentShader';
import getVertexShader from '~/inc/getVertexShader';
import getCanvasElement from '~/inc/getCanvasElement';
import initWebGL2RenderingContext from '~/inc/initWebGL2RenderingContext';
import initProgram from './inc/initProgram';

type Program = WebGLProgram & {
    aVertexPosition: number;
}

export default (  ) => {

    let canvas: HTMLCanvasElement;
    let gl: WebGL2RenderingContext;
    let program: Program;
    let squareVertexBuffer, squareIndexBuffer: WebGLBuffer | null;
    let squareVAO: WebGLVertexArrayObject | null;
    let indices: Array<number>;

    const initBuffer = (  ) => {

        // 頂点配列
        const vertices = [
            -.5, .5, 0,
            -.5, -.5, 0,
            .5, -.5, 0,
            .5, .5, 0,
        ];

        // フラグメント(三角)配列 反時計回りで定義されたインデックス
        indices = [ 0, 1, 2, 0, 2, 3 ];

        // VAOインスタンス作成
        squareVAO = gl.createVertexArray(  );

        // バインドしてその上で処理
        gl.bindVertexArray( squareVAO );

        squareVertexBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

        // draw内で後ほどデータを使用するためにVAOの命令を実行
        gl.enableVertexAttribArray( program.aVertexPosition );
        gl.vertexAttribPointer( program.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

        // IBOの準備
        squareIndexBuffer = gl.createBuffer(  );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );

        // クリア
        gl.bindVertexArray( null );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

    }

    const draw = (  ) => {

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

        // VAOをバインド
        gl.bindVertexArray( squareVAO );

        // トライアングルプリミティブを使用してシーンを描画
        gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );

        // クリア
        gl.bindVertexArray( null );

    };

    const init = (  ) => {

        canvas = getCanvasElement( '#canvas3d' );
        gl = initWebGL2RenderingContext( canvas );
        gl.clearColor( 0, 0, 0, 1 );
        program = initProgram(
            gl,
            getVertexShader( gl, vert ),
            getFragmentShader( gl, frag )
        );
        initBuffer(  );
        draw(  );

    };

    window.addEventListener( 'DOMContentLoaded', init, { once: true, } );

}
