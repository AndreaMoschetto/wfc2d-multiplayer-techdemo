import { Player } from "@root/characters/player";
import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { Images } from "@root/resources";
import { BoundingBox, Engine, Input, SceneActivationContext, SpriteSheet, Tile, TileMap } from "excalibur";
import { Room } from "./room";

export class MapTest extends Room {
    private tilemap: TileMap
    private tilemapSpriteSheet!: SpriteSheet
    //private player: Player

    private padding!: number
    private screenWidth!: number
    private screenHeight!: number
    private mapWidth!: number
    private mapHeight!: number
    private box!: BoundingBox

    public constructor() {
        super();
        this.tilemap = new TileMap({
            rows: 30,
            columns: 40,
            tileWidth: 32,
            tileHeight: 32,
        });


        this.player = new Player("bob")
    }

    override onInitialize(_engine: Engine): void {
        super.onInitialize(_engine)
        EventManager.getInstance().on('mapGenerated', this.handleMapGenerated.bind(this))

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

        this.padding = 1
        this.screenWidth = _engine.canvasWidth
        this.screenHeight = _engine.canvasHeight;
        this.mapWidth = this.tilemap.columns * this.tilemap.tileWidth;
        this.mapHeight = this.tilemap.rows * this.tilemap.tileHeight;
        this.box = new BoundingBox(
            this.padding,
            this.padding,
            this.mapWidth - this.padding,
            this.mapHeight - this.padding
        )
        console.log(`screenWidth:${this.screenWidth}\nscreenHeight:${this.screenHeight}\nmapWidth:${this.mapWidth}\nmapHeight:${this.mapHeight}`)
        console.log(this.box)
        this.produceMap()
    }

    private spawnPlayer() {
        let initialTile!: Tile
        const tilePadding = 1
        while(true){
            let tileX = Math.floor(tilePadding + Math.random() * (this.tilemap.columns - tilePadding*2))
            let tileY = Math.floor(tilePadding + Math.random() * (this.tilemap.rows - tilePadding*2))
            console.log(`tile coords: ${tileX}, ${tileY}`)
    
            initialTile = this.tilemap.getTile(tileX, tileY)
            console.log(initialTile)
            if (!initialTile.solid) break
        }
        this.player.pos.setTo(initialTile.pos.x, initialTile.pos.y)
        console.log(`player at ${this.player.pos.x}, ${this.player.pos.y}\ntile at: ${initialTile.pos.x}, ${initialTile.pos.y}`)
        this.camera.strategy.lockToActor(this.player)
        this.camera.strategy.limitCameraBounds(this.box)
        this.add(this.player)
    }

    private produceMap() {
        WebSocketManager.getInstance().sendMapRequest(this.tilemap.rows, this.tilemap.columns)
    }

    private handleMapGenerated(matrix: [number, number, boolean][][]){
        this.remove(this.tilemap)
        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                const [mat_x, mat_y] = [matrix[y]![x]?.[1]!, matrix[y]![x]?.[0]!]
                const solidity = matrix[y]![x]?.[2]!

                const graphic = this.tilemapSpriteSheet.getSprite(mat_x, mat_y)!
                this.tilemap.getTile(x, y).addGraphic(graphic)
                this.tilemap.getTile(x, y).solid = solidity
            }
        }
        console.log('adding, map')
        console.log(matrix)
        this.add(this.tilemap)
        this.spawnPlayer()
    }

    override onPostUpdate(_engine: Engine, _delta: number): void {
        if (_engine.input.keyboard.isHeld(Input.Keys.R)) {
            this.produceMap()
        }
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        super.onActivate(_context)
        this.tilemap.scale.setTo(1, 1)
        this.camera.zoom = 1.5
    }
}