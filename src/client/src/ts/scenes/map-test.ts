import { Player } from "@root/characters/player";
import { Images } from "@root/resources";
import { WaveFunctionCollapse } from "@root/utils/wave-function-collapse";
import { BoundingBox, Color, Engine, Input, Scene, SceneActivationContext, ScreenElement, SpriteSheet, TileMap, vec } from "excalibur";

export class MapTest extends Scene {
    private tilemap: TileMap
    private tilemapSpriteSheet!: SpriteSheet
    private player: Player

    private padding!: number
    private screenWidth!: number
    private screenHeight!: number
    private mapWidth!: number
    private mapHeight!: number

    public constructor() {
        super();
        this.tilemap = new TileMap({
            rows: 100,
            columns: 100,
            tileWidth: 32,
            tileHeight: 32,
        });


        this.player = new Player("bob")
    }

    override onInitialize(_engine: Engine): void {
        this.tilemapSpriteSheet = SpriteSheet.fromImageSource({
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

        this.padding = 10
        this.screenWidth = _engine.canvasWidth
        this.screenHeight = _engine.canvasHeight;
        this.mapWidth = this.tilemap.columns * this.tilemap.tileWidth;
        this.mapHeight = this.tilemap.rows * this.tilemap.tileHeight;

        this.produceMap()

        const box = new BoundingBox(
            this.padding,
            this.padding,
            this.mapWidth - this.screenWidth - this.padding,
            this.mapHeight - this.screenHeight - this.padding
        )

        this.camera.strategy.lockToActor(this.player)
        this.camera.strategy.limitCameraBounds(box);
    }

    private produceMap() {
        let wfc = new WaveFunctionCollapse(this.tilemap.rows, this.tilemap.columns, this.tilemapSpriteSheet.columns, this.tilemapSpriteSheet.rows)
        const matrix = wfc.resolve()

        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                const graphic = this.tilemapSpriteSheet.getSprite(matrix[y]![x]?.[1]!, matrix[y]![x]?.[0]!)!
                this.tilemap.getTile(x, y).addGraphic(graphic)
            }
        }
    }

    override onPostUpdate(_engine: Engine, _delta: number): void {
        if (_engine.input.keyboard.isHeld(Input.Keys.R)) {
            this.produceMap()
        }
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.add(this.tilemap)
        this.add(this.player)
        this.player.pos.setTo(this.mapWidth/4, this.mapHeight/4)
        this.tilemap.scale.setTo(1, 1)
        this.camera.zoom = 1
    }
}