import { ImageSource, Loader } from "excalibur";

const Images = {
    tilemapImage: new ImageSource('tilemap.png')
}

const loader = new Loader()
loader.addResource(Images.tilemapImage)

export { loader, Images }
