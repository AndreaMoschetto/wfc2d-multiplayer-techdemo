import { ImageSource, Loader } from "excalibur";

const Images = {
    tilemapImage: new ImageSource('tilemap_packed.png')
}

const loader = new Loader()
loader.addResource(Images.tilemapImage)

export { loader, Images }
