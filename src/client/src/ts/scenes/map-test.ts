import { Player } from "@root/characters/player";
import { Images } from "@root/resources";
import { WaveFunctionCollapse } from "@root/utils/wave-function-collapse";
import { Engine, Scene, SceneActivationContext, SpriteSheet, TileMap } from "excalibur";

export class MapTest extends Scene {
    private tilemap: TileMap

    public constructor() {
        super();
        this.tilemap = new TileMap({
            rows: 10,
            columns: 10,
            tileWidth: 32,
            tileHeight: 32,
        });

    }

    override onInitialize(_engine: Engine): void {
        const tilemapSpriteSheet = SpriteSheet.fromImageSource({
            image: Images.tilemapImage,
            grid: {
                rows: 6,
                columns: 3,
                spriteHeight: 32,
                spriteWidth: 32
            },
            spacing: {
                margin: {
                    x: 0,
                    y: 0
                }
            }
        });
        let wfc = new WaveFunctionCollapse(10, 10, tilemapSpriteSheet.columns, tilemapSpriteSheet.rows)
        const matrix = wfc.resolve()

        for(let y = 0; y < this.tilemap.rows; y++){
            for(let x = 0; x < this.tilemap.columns; x++){
                const graphic = tilemapSpriteSheet.getSprite(matrix[y]![x]?.[1]!, matrix[y]![x]?.[0]!)!
                this.tilemap.getTile(x,y).addGraphic(graphic)
            }
        }
        
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.add(this.tilemap)
        this.tilemap.scale.setTo(2, 2)
        this.add(new Player("bru"))
    }
}