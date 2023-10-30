import { ADJACENCY_ROLES } from "../client/src/ts/constants"

class WFCSlot {
    public readonly y: number
    public readonly x: number
    public possibleTiles: string[]
    public chosenOne: string
    private solid: boolean

    constructor(y: number, x: number) {
        this.y = y
        this.x = x
        this.chosenOne = ''
        this.solid = false
        this.possibleTiles = []

        this.possibleTiles = NeighbourConstraints.getAllPossibleTiles()
    }

    public constraint(adjacencyFilter: string[]): boolean {
        const preLength = this.getEntropy()
        this.possibleTiles = this.possibleTiles.filter(
            elem => {
                return adjacencyFilter.includes(elem)
            }
        )
        if (this.getEntropy() == 1) {
            this.chosenOne = this.possibleTiles[0] ?? ''
            this.solid = NeighbourConstraints.getSolidity(this.chosenOne)
        }
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
        this.constraint([this.possibleTiles[index]!])
    }

    public isSolid(): boolean {
        return this.solid
    }

    public getChosenId(): string {
        return this.chosenOne
    }
}

class WFCMatrix {
    private matrix: WFCSlot[][]
    private columns: number
    private rows: number

    constructor(height: number, width: number) {
        this.columns = width
        this.rows = height
        this.matrix = new Array<Array<WFCSlot>>(this.rows)
        for (let y = 0; y < this.rows; y++) {
            this.matrix[y] = new Array<WFCSlot>(this.columns)
            for (let x = 0; x < this.columns; x++) {
                this.matrix[y]![x] = new WFCSlot(y, x)
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
        let logging: string = ''
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const entropy = this.matrix[i]![j]!.getEntropy()
                const value = entropy != 1 ? entropy : this.matrix[i]![j]!.getChosenId()
                logging += (`(${value}) `)
            }
            logging += '\n'
        }
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
    constructor(height: number, width: number) {
        this.matrix = new WFCMatrix(height, width)
    }

    public resolve(): [number, number, boolean][][] {
        while (!this.matrix.isCollapsed()) {
            let slot: WFCSlot = this.matrix.selectSlot()
            if (slot.getEntropy() == 0) {
                this.matrix.cleanUp()
                break
            }
            slot.collapse()
            this.propagate(slot)
        }
        return this.matrix.getAllKeys()
    }

    private propagate(startingSlot: WFCSlot) {
        let stack: WFCSlot[] = [startingSlot]

        while (stack.length > 0) {
            //this.matrix.logMatrix()
            let current = stack.pop()!
            let adjacentSlots = this.matrix.getAdjacentSlots(current)
            for (let i = 0; i < adjacentSlots.length; i++) {
                let adj = adjacentSlots[i]!
                if (adj === undefined) continue
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
    private static roles = ADJACENCY_ROLES

    public static getRoles(id: string): string[][] {
        return this.roles[id]!['adjacency'] ?? []
    }

    public static getSolidity(id: string): boolean {
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