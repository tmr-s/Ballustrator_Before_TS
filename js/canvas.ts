const CANVAS = {
    createImage: (canvas: HTMLCanvasElement): Promise<CanvasImageSource> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
            image.src = canvas.toDataURL();
        });
    }
}
export default CANVAS;