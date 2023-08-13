import { Player } from "@root/characters/player";
import { Images } from "@root/resources";
import { Engine, Scene, SceneActivationContext, SpriteSheet, TileMap } from "excalibur";

export class MapTest extends Scene {
    private tilemap!: TileMap
    override onInitialize(_engine: Engine): void {


        const tilemapSpriteSheet = SpriteSheet.fromImageSource({
            image: Images.tilemapImage,
            grid: {
                rows: 11,
                columns: 13,
                spriteHeight: 16,
                spriteWidth: 16
            },
            spacing: {
                margin: {
                    x: 0,
                    y: 0
                }
            }
        });

        this.tilemap = new TileMap({
            rows: 11,
            columns: 13,
            tileWidth: 16,
            tileHeight: 16,
        });

        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                const sprite = tilemapSpriteSheet.getSprite(x, y);
                this.tilemap.getTile(x,y).addGraphic(sprite!)
            }
        }
    }
    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.add(this.tilemap)
        this.tilemap.scale.setTo(3,3)
        this.add(new Player("bru"))
    }
}