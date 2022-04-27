export default ( id: string ): HTMLCanvasElement => {
    const canvas = document.querySelector( `#${ id }` ) as HTMLCanvasElement | null;
    if ( ! canvas ) {
        throw new Error( `Could not fetch canvas element(id: ${ id }).` );
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
};
