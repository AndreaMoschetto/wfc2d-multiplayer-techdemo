import { Player } from "@root/characters/player";
import { Images } from "@root/resources";
import { Engine, Scene, SceneActivationContext, SpriteSheet, TileMap } from "excalibur";

export class MapTest extends Scene {
    private tilemap!: TileMap
    private wfcMatrix!: [number, number][][][];
    private neighbours!: Record<string, string[][]>

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
                    x: 1,
                    y: 1
                }
            }
        });

        this.tilemap = new TileMap({
            rows: 11,
            columns: 13,
            tileWidth: 16,
            tileHeight: 16,
        });
        //----------------------------------------------------------
        let allCoords: [number, number][] = []
        for (let y = 0; y < tilemapSpriteSheet.rows; y++) {
            for (let x = 0; x < tilemapSpriteSheet.columns; x++) {
                allCoords.push([x, y])
            }
        }

        this.wfcMatrix = []
        for (let y = 0; y < this.tilemap.rows; y++) {
            this.wfcMatrix[y] = new Array(this.tilemap.columns)
            for (let x = 0; x < this.tilemap.columns; x++) {
                this.wfcMatrix[y]![x] = [...allCoords]
                if(this.wfcMatrix[x] != undefined) 
                    if(this.wfcMatrix[x]![y] != undefined)
                        console.log(`${x}:${y}=${this.wfcMatrix[x]![y]!} `)
            }
            console.log('\n')
        }

        this.neighbours = {
            "0_0": [['5_1'], ['0_1', '0_2'], ['1_0', '2_0'], ['4_2']],
            "0_1": [['5_1'], ['0_2', '0_1'], ['1_1', '2_1'], ['0_0', '0_1']],
            "0_2": [['5_1'], ['4_1'], ['1_2', '2_2'], ['0_0', '0_1']],

            "1_0": [['0_0', '1_0'], ['1_1', '2_1'], ['1_0', '2_0'], ['4_2']],
            "1_1": [['1_1', '0_1'], ['1_1', '1_2'], ['1_1', '2_1'], ['1_1', '1_0']],
            "1_2": [['0_2', '1_2'], ['4_0'], ['1_2', '2_2'], ['1_1', '0_1']],

            "2_0": [['1_0', '2_0'], ['2_1', '2_2'], ['3_1'], ['4_2']],
            "2_1": [['1_1', '0_1'], ['2_1', '2_2'], ['3_1'], ['2_1', '2_0']],
            "2_2": [['1_2', '0_2'], ['4_0'], ['3_2'], ['2_1', '2_0']],

            "3_0": [[], [], [], []],
            "3_1": [[], [], [], []],
            "3_2": [[], [], [], []],

            "4_0": [[], [], [], []],
            "4_1": [[], [], [], []],
            "4_2": [[], [], [], []],

            "5_0": [[], [], [], []],
            "5_1": [[], [], [], []],
            "5_2": [[], [], [], []],
        }

        while (!this.isCollapsed()) {
            console.log('START')
            let slot_coords = this.selectSlot()
            console.log('first: ' + slot_coords)
            this.collapse(...slot_coords)
            this.propagate(...slot_coords)
        }
        console.log('ORA VEDIAMO')
        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                if(this.wfcMatrix[x] != undefined) 
                    if(this.wfcMatrix[x]![y] != undefined)
                        console.log(`${x}:${y}=${this.wfcMatrix[x]![y]!} `)
            }
            console.log('\n')
        }

    }

    private selectSlot(): [number, number] {
        let coords: [number, number] = [0, 0]
        let minLength = 100
        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                if (this.wfcMatrix[x]![y]!.length < minLength) {
                    minLength = this.wfcMatrix[x]![y]!.length
                    coords = [x, y]
                }
            }
        }
        return coords
    }

    private isCollapsed() {
        for (let y = 0; y < this.tilemap.rows; y++) {
            for (let x = 0; x < this.tilemap.columns; x++) {
                if (this.wfcMatrix[x]![y]!.length > 1) {
                    return false
                }
            }
        }
        return true
    }

    private collapse(x: number, y: number) {
        let index = Math.floor(Math.random() * (this.wfcMatrix[x]![y]!.length + 1));
        this.wfcMatrix[x]![y]! = [this.wfcMatrix[x]![y]![index]!]
    }

    private propagate(x: number, y: number) {
        let stack: [number, number][] = [[x, y]]

        while (stack.length > 0) {
            let current = stack.pop()!
            let adjacents = this.getAdjacents(...current)
            for (let i: number = 0; i < adjacents.length; i++) {
                const preLength = this.wfcMatrix[adjacents[i]![0], adjacents[i]![1]]?.length!
                this.constraint(current[0], current[1], adjacents[i]![0], adjacents[i]![1], i)
                if (preLength > this.wfcMatrix[adjacents[i]![0], adjacents[i]![1]]?.length!) {
                    stack.push(adjacents[i]!)
                }
            }
        }

    }

    private getAdjacents(x: number, y: number): [number, number][] {

        const adjacentCoordinates: [number, number][] = [];

        if (x < this.tilemap.columns - 1) {
            adjacentCoordinates.push([x + 1, y]);
        }

        if (x > 0) {
            adjacentCoordinates.push([x - 1, y]);
        }

        if (y > 0) {
            adjacentCoordinates.push([x, y - 1]);
        }

        if (y < this.tilemap.rows - 1) {
            adjacentCoordinates.push([x, y + 1]);
        }

        return adjacentCoordinates;
    }

    private constraint(currX: number, currY: number, neighX: number, neighY: number, adjacency_index: number) {
        console.log('CONSTRAINT')
        let possibleNeighbours: string[] = this.neighbours[`${currX}_${currY}`]![adjacency_index]!
        this.wfcMatrix[neighX]![neighY] = this.wfcMatrix[neighX]![neighY]!.filter(item => possibleNeighbours.includes(`${item[0]}_${item[1]}`))
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.add(this.tilemap)
        this.tilemap.scale.setTo(2, 2)
        this.add(new Player("bru"))
    }
}