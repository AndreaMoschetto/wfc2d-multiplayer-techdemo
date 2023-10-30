import { ImageSource, Loader } from "excalibur";
import { EventManager } from "./managers/event-manager";
import { WebSocketManager } from "./managers/websocket-manager";



const loadImage = () => {
    return new Promise((resolve) => {
        EventManager.getInstance().on('tilemapData', (data: number[]) => {
            const uint8Array = new Uint8Array(data);
            const blob = new Blob([uint8Array], { type: 'image/png' });

            const image = new Image();
            image.src = URL.createObjectURL(blob);

            image.onload = () => {
                // Convert the Image to a data URI
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(image, 0, 0);
                const dataUri = canvas.toDataURL('image/png');

                // Create an ImageSource from the data URI
                const tilemapImage = new ImageSource(dataUri);
                resolve(tilemapImage);
            };
        });
        WebSocketManager.getInstance().tileMapRequest();
    });
};
let Images: { tilemapImage: ImageSource }
let loader: Loader = new Loader();

(async () => {
    const tilemapImage = await loadImage() as ImageSource;

    Images = {
        tilemapImage: tilemapImage,
    };

    loader.addResource(Images.tilemapImage);
    await loader.load();
})();


export { loader, Images }



