import { WebSocketManager } from "@root/managers/websocket-manager";
import { Images } from "@root/resources";
import { BoundingBox, Engine, Input, SceneActivationContext, SpriteSheet, Tile, TileMap } from "excalibur";
import { Room } from "./room";
import { TILEMAP_COLUMNS, TILEMAP_ROWS, TILE_HEIGHT, TILE_WIDTH } from "@root/constants";

export class MapTest extends Room {
    private tilemap: TileMap
    private tilemapSpriteSheet!: SpriteSheet

    private padding!: number
    private mapWidth!: number
    private mapHeight!: number
    private box!: BoundingBox

    public constructor() {
        super();
        this.tilemap = new TileMap({
            rows: TILEMAP_ROWS,
            columns: TILEMAP_COLUMNS,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,
        });
    }

    override onInitialize(_engine: Engine): void {
        super.onInitialize(_engine)

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
        this.mapWidth = this.tilemap.columns * this.tilemap.tileWidth;
        this.mapHeight = this.tilemap.rows * this.tilemap.tileHeight;
        this.box = new BoundingBox(
            this.padding,
            this.padding,
            this.mapWidth - this.padding,
            this.mapHeight - this.padding
        )
        
    }

    private spawnPlayer() {
        let initialTile!: Tile
        const tilePadding = 1
        while(true){
            let tileX = Math.floor(tilePadding + Math.random() * (this.tilemap.columns - tilePadding*2))
            let tileY = Math.floor(tilePadding + Math.random() * (this.tilemap.rows - tilePadding*2))
    
            initialTile = this.tilemap.getTile(tileX, tileY)
            
            if (!initialTile.solid) break
        }
        this.player.pos.setTo(initialTile.pos.x, initialTile.pos.y)
        
        this.camera.strategy.lockToActor(this.player)
        this.camera.strategy.limitCameraBounds(this.box)
        this.add(this.player)
    }

    protected override generateLevel(matrix: [number, number, boolean][][]): void {
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
        
        this.add(this.tilemap)
        this.spawnPlayer()
    }

    override onPostUpdate(_engine: Engine, _delta: number): void {
        if (_engine.input.keyboard.isHeld(Input.Keys.R)) {
            this.spawnPlayer()
            WebSocketManager.getInstance().sendPosition(this.player.name, this.player.pos)
        }
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        super.onActivate(_context)
        this.tilemap.scale.setTo(1, 1)
        this.camera.zoom = 1.5
    }
}