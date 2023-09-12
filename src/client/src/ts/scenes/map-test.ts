import { Player } from "@root/characters/player";
import { Images } from "@root/resources";
import { WaveFunctionCollapse } from "@root/utils/wave-function-collapse";
import { BoundingBox, Engine, Input, Scene, SceneActivationContext, SpriteSheet, TileMap, vec } from "excalibur";

export class MapTest extends Scene {
    private tilemap: TileMap
    private tilemapSpriteSheet!: SpriteSheet
    private player: Player

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
        
        this.produceMap()

        const padding = 50
        const screenWidth = _engine.canvasWidth
        const screenHeight = _engine.canvasHeight;

        // Ottenere le dimensioni della mappa (ad esempio, se usi un TileMap)
        const mapWidth = this.tilemap.columns * this.tilemap.tileWidth;
        const mapHeight = this.tilemap.rows * this.tilemap.tileHeight;

        const box = new BoundingBox(
            padding,
            padding,
            mapWidth - screenWidth - padding,
            mapHeight - screenHeight - padding
        )
        _engine.currentScene.camera.strategy.lockToActor(this.player)
        _engine.currentScene.camera.strategy.limitCameraBounds(box);
    }

    private produceMap(){
        let wfc = new WaveFunctionCollapse(this.tilemap.rows, this.tilemap.columns, this.tilemapSpriteSheet.columns, this.tilemapSpriteSheet.rows)
        const matrix = wfc.resolve()

        for(let y = 0; y < this.tilemap.rows; y++){
            for(let x = 0; x < this.tilemap.columns; x++){
                const graphic = this.tilemapSpriteSheet.getSprite(matrix[y]![x]?.[1]!, matrix[y]![x]?.[0]!)!
                this.tilemap.getTile(x,y).addGraphic(graphic)
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
        this.tilemap.scale.setTo(1, 1)
        _context.engine.currentScene.camera.zoom = 2
        this.add(this.player)
    }
}