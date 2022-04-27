export default ( canvas: HTMLCanvasElement ) => {
    const expandFullScreen = (  ) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    expandFullScreen(  );
    window.addEventListener( 'resize', expandFullScreen, false );
};
