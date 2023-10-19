import { AppOne } from './AppOne';

window.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    let app = new AppOne(canvas);
    app.run();
});