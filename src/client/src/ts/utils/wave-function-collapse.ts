
class WFCSlot {
    public readonly y: number
    public readonly x: number
    public possibleTiles: string[]
    public chosenOne: string
    private solid: boolean

    constructor(y: number, x: number, tilesCols: number, tilesRows: number) {
        this.y = y
        this.x = x
        this.chosenOne = ''
        this.solid = false
        this.possibleTiles = []

        this.possibleTiles = NeighbourConstraints.getAllPossibleTiles()
    }

    public constraint(adjacencyFilter: string[]): boolean {
        const preLength = this.getEntropy()
        //console.log(`CONSTRAINT`)
        //console.log(`coords: y:${this.y}, x:${this.x}`)
        //console.log(`possible tiles: ${this.possibleTiles}`)
        //console.log(`filter: ${adjacencyFilter}`)
        this.possibleTiles = this.possibleTiles.filter(
            elem => {
                return adjacencyFilter.includes(elem)
            }
        )
        if (this.getEntropy() == 1){
            this.chosenOne = this.possibleTiles[0] ?? ''
            this.solid = NeighbourConstraints.getSolidity(this.chosenOne)
        }

        //console.log("finished filtering")
        //console.log(this)
        if (preLength != this.getEntropy()) return true
        return false
    }

    public getPossibleTiles(): string[] {
        return this.possibleTiles
    }

    public getEntropy(): number {
        return this.possibleTiles.length
    }

    public collapse() {
        let index = Math.floor(Math.random() * this.possibleTiles.length);
        //console.log(`randomTileIndex: ${index}`)
        this.constraint([this.possibleTiles[index]!])

        //console.log(this.possibleTiles)
    }

    public isSolid(): boolean{
        return this.solid
    }

    //to define-------
    public getChosenId(): string {
        return this.chosenOne
    }
}

class WFCMatrix {
    private matrix: WFCSlot[][]
    private columns: number
    private rows: number

    constructor(height: number, width: number, tilesCols: number, tilesRows: number) {
        this.columns = width
        this.rows = height
        this.matrix = new Array<Array<WFCSlot>>(this.rows)
        for (let y = 0; y < this.rows; y++) {
            this.matrix[y] = new Array<WFCSlot>(this.columns)
            for (let x = 0; x < this.columns; x++) {
                this.matrix[y]![x] = new WFCSlot(y, x, tilesCols, tilesRows)
            }
        }
    }

    public isCollapsed(): boolean {
        let isCollapsed: boolean = true
        this.matrix.forEach(
            row => {
                row.forEach(
                    slot => {
                        if (slot.getEntropy() != 1)
                            isCollapsed = false
                    }
                )
            })
        return isCollapsed
    }

    public selectSlot(): WFCSlot {
        let minEntropy = 100
        let minEntropySlot: WFCSlot = this.matrix.at(0)!.at(0)!
        this.matrix.forEach(
            row => {
                row.forEach(
                    slot => {
                        if (slot.getEntropy() < minEntropy && slot.getEntropy() > 1) {
                            minEntropy = slot.getEntropy()
                            minEntropySlot = slot
                        }
                    }
                )
            })
        return minEntropySlot
    }

    public getAdjacentSlots(slot: WFCSlot): WFCSlot[] {
        const x = slot.x
        const y = slot.y
        //console.log(`searching adjacency slots of: ${y},${x}:`)
        let adjacentSlots: WFCSlot[] = new Array(4)

        if (y > 0)
            adjacentSlots[AdiacencyType.TOP] = (this.matrix[y - 1]![x]!);

        if (x < this.columns - 1)
            adjacentSlots[AdiacencyType.RIGHT] = (this.matrix[y]![x + 1]!);

        if (y < this.rows - 1)
            adjacentSlots[AdiacencyType.BOTTOM] = (this.matrix[y + 1]![x]!);

        if (x > 0)
            adjacentSlots[AdiacencyType.LEFT] = (this.matrix[y]![x - 1]!);

        return adjacentSlots
    }

    public logMatrix() {
        //console.log("MATRIX:")
        let logging: string = ''
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const entropy = this.matrix[i]![j]!.getEntropy()
                const value = entropy != 1 ? entropy : this.matrix[i]![j]!.getChosenId()
                logging += (`(${value}) `)
            }
            logging += '\n'
        }
        //console.log(logging)
        //console.log("END MATRIX")
    }

    public getAllKeys(): [number, number, boolean][][] {
        const allKeys = new Array<Array<[number, number, boolean]>>(this.rows)
        for (let y = 0; y < this.rows; y++) {
            allKeys[y] = new Array<[number, number, boolean]>(this.columns)
            for (let x = 0; x < this.columns; x++) {
                const [j, i] = this.matrix[y]![x]?.getChosenId().split('_').map(Number) ?? [0, 0]
                const solidity = this.matrix[y]![x]?.isSolid() ?? false
                allKeys[y]![x] = [j!, i!, solidity]
            }
        }

        return allKeys
    }

    public cleanUp() {
        //console.log("CLEANUP")
        this.matrix.forEach(row => {
            row.forEach(slot => {
                if (slot.getEntropy() === 0) {
                    slot.possibleTiles = ['4_1']
                    slot.chosenOne = '4_1'
                }

            })
        });
    }
}

export class WaveFunctionCollapse {
    matrix!: WFCMatrix
    constructor(height: number, width: number, tilesCols: number, tilesRows: number) {
        this.matrix = new WFCMatrix(height, width, tilesCols, tilesRows)
    }

    public resolve(): [number, number, boolean][][] {
        this.matrix.logMatrix()
        while (!this.matrix.isCollapsed()) {
            let slot: WFCSlot = this.matrix.selectSlot()
            if (slot.getEntropy() == 0) {
                this.matrix.cleanUp()
                break
            }
            slot.collapse()
            this.propagate(slot)
            this.matrix.logMatrix()

            this.matrix.logMatrix()
        }
        this.matrix.logMatrix()
        return this.matrix.getAllKeys()
    }

    private propagate(startingSlot: WFCSlot) {
        let stack: WFCSlot[] = [startingSlot]

        while (stack.length > 0) {
            let current = stack.pop()!
            //console.log("current:")
            //console.log(current)
            let adjacentSlots = this.matrix.getAdjacentSlots(current)
            //console.log("adjacentSlots:")
            //console.log(adjacentSlots)
            for (let i = 0; i < adjacentSlots.length; i++) {
                let adj = adjacentSlots[i]!
                if (adj === undefined) continue
                //console.log("accepted: " + i)
                if (this.constraint(current, adj, i))
                    stack.push(adj)
            }
        }
    }

    private constraint(slot: WFCSlot, neighbour: WFCSlot, i: AdiacencyType): boolean {
        let possibleTiles = slot.getPossibleTiles()
        let filter: string[] = []
        possibleTiles.forEach(tileId => {
            filter = filter.concat(NeighbourConstraints.getRoles(tileId)[i]!)
        });
        if (neighbour.constraint(filter))
            return true
        return false
    }
}


class NeighbourConstraints {
    private static __roles: Record<string, string[][]> = {
        "0_0": [['5_1'], ['0_1', '0_2'], ['1_0', '2_0'], ['4_2']],
        "0_1": [['5_1'], ['0_2', '0_1'], ['1_1', '2_1'], ['0_0', '0_1']],
        "0_2": [['5_1'], ['4_1'], ['1_2', '2_2'], ['0_0', '0_1']],

        "1_0": [['0_0', '1_0'], ['1_1', '2_1'], ['1_0', '2_0'], ['4_2']],
        "1_1": [['1_1', '0_1'], ['1_1', '1_2'], ['1_1', '2_1'], ['1_1', '1_0']],
        "1_2": [['0_2', '1_2'], ['4_0'], ['1_2', '2_2'], ['1_1', '0_1']],

        "2_0": [['1_0', '2_0'], ['2_1', '2_2'], ['3_1'], ['4_2']],
        "2_1": [['1_1', '0_1'], ['2_1', '2_2'], ['3_1'], ['2_1', '2_0']],
        "2_2": [['1_2', '0_2'], ['4_0'], ['3_2'], ['2_1', '2_0']],

        "3_0": [['2_0'], ['3_1', '3_2'], ['4_0', '5_0'], ['1_2']],
        "3_1": [['2_1'], ['3_1', '3_2'], ['4_1'], ['3_1', '3_0']],
        "3_2": [['2_1'], ['1_0'], ['4_2', '5_2'], ['3_1', '3_0']],

        "4_0": [['4_0', '3_0'], ['4_1', '4_2'], ['4_0', '5_0'], ['1_2']],
        "4_1": [['4_1', '3_1'], ['4_1', '4_2'], ['4_1', '5_1'], ['4_1', '4_0']],
        "4_2": [['4_2', '3_2'], ['1_0'], ['4_2', '5_2'], ['4_1', '4_0']],

        "5_0": [['4_0', '3_0'], ['5_1', '5_2'], ['0_1'], ['1_2']],
        "5_1": [['4_1', '3_1'], ['5_1', '5_2'], ['0_1'], ['5_1', '5_0']],
        "5_2": [['4_2', '3_2'], ['1_0'], ['0_1'], ['5_2', '5_1']],
    }
    private static _roles: Record<string, string[][]> = {
        "0_0": [['4_1'], ['0_1', '0_2'], ['1_0', '2_0'], ['4_1']],
        "0_1": [['4_1'], ['0_1', '0_2'], ['1_1', '2_1'], ['0_0', '0_1']],
        "0_2": [['4_1'], ['4_1'], ['1_2', '2_2'], ['0_0', '0_1']],

        "1_0": [['0_0', '1_0'], ['1_1', '1_2'], ['1_0', '2_0'], ['4_1']],
        "1_1": [['1_1', '0_1'], ['1_1', '1_2'], ['1_1', '2_1'], ['1_1', '1_0']],
        "1_2": [['0_2', '1_2'], ['4_1'], ['1_2', '2_2'], ['1_1', '1_0']],

        "2_0": [['1_0', '0_0'], ['2_1', '2_2'], ['4_1'], ['4_1']],
        "2_1": [['1_1', '0_1'], ['2_1', '2_2'], ['4_1'], ['2_1', '2_0']],
        "2_2": [['1_2', '0_2'], ['4_1'], ['4_1'], ['2_1', '2_0']],

        "4_1": [['4_1', '2_0', '2_1', '2_2'], ['4_1', '0_0', '1_0', '2_0'], ['4_1', '0_0', '0_1', '0_2'], ['4_1', '0_2', '1_2', '2_2']],
    }
    private static roles: Record<string, { "adjacency": string[][], "solid": boolean }> = {
        "0_0": {
            "adjacency": [['4_1'], ['0_1', '0_2'], ['1_0', '2_0'], ['4_1']],
            "solid": true
        },
        "0_1": {
            "adjacency": [['4_1'], ['0_1', '0_2'], ['1_1', '2_1'], ['0_0', '0_1']],
            "solid": true
        },
        "0_2": {
            "adjacency": [['4_1'], ['4_1'], ['1_2', '2_2'], ['0_0', '0_1']],
            "solid": true
        },
        "1_0": {
            "adjacency": [['0_0', '1_0'], ['1_1', '1_2'], ['1_0', '2_0'], ['4_1']],
            "solid": true
        },
        "1_1": {
            "adjacency": [['1_1', '0_1'], ['1_1', '1_2'], ['1_1', '2_1'], ['1_1', '1_0']],
            "solid": true
        },
        "1_2": {
            "adjacency": [['0_2', '1_2'], ['4_1'], ['1_2', '2_2'], ['1_1', '1_0']],
            "solid": true
        },
        "2_0": {
            "adjacency": [['1_0', '0_0'], ['2_1', '2_2'], ['4_1'], ['4_1']],
            "solid": true
        },
        "2_1": {
            "adjacency": [['1_1', '0_1'], ['2_1', '2_2'], ['4_1'], ['2_1', '2_0']],
            "solid": true
        },
        "2_2": {
            "adjacency": [['1_2', '0_2'], ['4_1'], ['4_1'], ['2_1', '2_0']],
            "solid": true
        },
        "4_1": {
            "adjacency": [['4_1', '2_0', '2_1', '2_2'], ['4_1', '0_0', '1_0', '2_0'], ['4_1', '0_0', '0_1', '0_2'], ['4_1', '0_2', '1_2', '2_2']],
            "solid": false
        },
    };


    public static getRoles(id: string): string[][] {
        return this.roles[id]!['adjacency'] ?? []
    }

    public static getSolidity(id: string): boolean{
        return this.roles[id]!['solid'] ?? false
    }

    public static getAllPossibleTiles(): string[] {
        return Object.keys(this.roles)
    }
}

enum AdiacencyType {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT
}