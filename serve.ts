import express from 'express';
import * as path from 'path';
const app = express(  );
const PORT = 8080;

app.use( express.static( path.join( __dirname, 'dist' ) ) );

app.get( '/', ( request, response ) => {
    response.sendFile( path.join( __dirname, 'public', 'index.html' ) );
} );

app.listen( PORT );
console.log( `Listen on port: ${ PORT }` );
