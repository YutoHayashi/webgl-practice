const esbuild = require( 'esbuild' );
const path = require( 'path' );
const glsl = require( 'esbuild-plugin-glsl' );
const sass = require( 'esbuild-sass-plugin' );

const args = process.argv
    .splice( 2 )
    .map( option => {
        const split = option.split( '=' );
        return { [ split[ 0 ] ]: split[ 1 ] || true, };
    } )
    .reduce( ( p, c ) => Object.assign( p, c ), {  } );

const options = {
    sourcemap: true,
    bundle: true,
    target: 'es2016',
    platform: 'browser',
    entryPoints: [ path.resolve( `${ __dirname }/src/index.ts` ), ],
    outdir: path.resolve( `${ __dirname }/dist` ),
    tsconfig: path.resolve( `${ __dirname }/tsconfig.json` ),
    minify: false,
    watch: args[ 'watch' ] && {
        onRebuild( error, result ) {
            console.log( `Rebuild` );
        },
    },
    plugins: [
        glsl.glsl( {
            minify: true,
        } ),
        sass.sassPlugin(  ),
    ],
};

esbuild.build( options )
    .catch( error => {
        process.stderr.write( error.stderr );
        process.exit( 1 );
    } );
