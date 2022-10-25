import Konva from '../src/index.ts';

export function sandboxDemo() {

    const stage = new Konva.Stage({
        container: '#container',
        width: window.innerWidth,
        height: window.innerHeight - 60
    });

    const layer = new Konva.Layer();

    stage.add(layer);

    return {
        stage,
        container: layer
    }

    //
    // transformer.nodes([rect]);
    //
    // layer.add(rect);
    // stage.on('wheel', (e) => {
    //     e.evt.preventDefault();
    //     console.log('wheel');
    // });
    // stage.on('contextmenu', (e) => {
    //     console.log('click');
    // });
}