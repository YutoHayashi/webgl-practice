import { GUI, GUIController } from 'dat.gui';

export type Props = {
    value: any,
    onChange: ( v: any, state: { [ guiName: string ]: any } ) => void;
    min?: number;
    max?: number;
    step?: number;
};

const isColor = ( v: any ) => ( typeof v === 'string' && ~v.indexOf( '#' ) ) || ( Array.isArray( v ) && v.length >= 3 );

export default (
    guiParams: ConstructorParameters<typeof GUI>[ 0 ] = {  },
    guiProps: {
        [ guiName: string ]: Props;
    } = {  },
): GUI => {
    const gui = new GUI( guiParams );
    const state: {
        [ guiName: keyof typeof guiProps ]: typeof guiProps[ typeof guiName ][ 'value' ];
    } = {  };
    Object.keys( guiProps ).forEach( guiName => {
        const { value, onChange, min = 0.0, max = 1.0, step = -0.1 } = guiProps[ guiName ];
        state[ guiName ] = value;
        let controller: GUIController;
        if ( isColor( value ) ) {
            controller = gui.addColor(
                state,
                guiName,
            );
        } else {
            controller = gui.add(
                state,
                guiName,
                min,
                max,
                step,
            );
        }
        controller.onChange( v => onChange( v, state ) );
    } );
    return gui;
};
