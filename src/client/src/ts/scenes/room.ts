import { Scene, SceneActivationContext } from "excalibur";
import { Player } from "@root/characters/player";
import { Character } from "@root/characters/character";
import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";

export abstract class Room extends Scene {
    protected player!: Player
    protected startingInfo!: { username: string, allCharacters: { username: string; position: { x: number; y: number } }[], 'mapMatrix': [number, number, boolean][][] }
    private characters: Character[]
    private playerCounter: HTMLElement


    constructor() {
        super()
        this.characters = []
        this.playerCounter = document.getElementById("player-counter")!
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.startingInfo = _context.data as { username: string, allCharacters: { username: string; position: { x: number; y: number } }[], mapMatrix: [number, number, boolean][][] }
        EventManager.getInstance().on('characterMoved', this.handleOnCharacterMoved)
        window.addEventListener('beforeunload', this.handleOnBeforeUnload)
        EventManager.getInstance().on('characterLeft', this.handleOnCharacterLeft)
        
        this.player = new Player(this.startingInfo.username)
        this.playerCounter.innerHTML = '1'
        this.generateLevel(this.startingInfo.mapMatrix)
        if(this.startingInfo.allCharacters)
            this.addCharacters(this.startingInfo.allCharacters)

    }
    protected abstract generateLevel(matrix: [number, number, boolean][][]): void

    public handleOnBeforeUnload = () => {
        WebSocketManager.getInstance().sendDisconnection(this.player.name)
    }
    public handleOnCharacterLeft = (data: { username: string }) => {
        const character = this.characters.filter(elem => elem.name === data.username).pop()!
        this.remove(character)
        this.characters = this.characters.filter(elem => elem !== character)
        this.playerCounter.innerHTML = (this.characters.length + 1).toString()
    }

    public handleOnCharacterMoved = (data: { username: string, position: { x: number, y: number } }) => {
        const username = data.username
        const x = data.position.x
        const y = data.position.y

        let character = this.characters.filter(a => a.name === username).pop()

        if (!character) {
            character = new Character(username)
            this.add(character)
            this.characters.push(character)
            this.playerCounter.innerHTML = (this.characters.length + 1).toString()
        }
        character.pos.setTo(x, y)
    }

    public addCharacters(allCharacters: { username: string; position: { x: number; y: number } }[]) {
        allCharacters.forEach(characterInfo => {
            let character = new Character(characterInfo.username, characterInfo.position.x, characterInfo.position.y)
            this.add(character)
            this.characters.push(character)
            this.playerCounter.innerHTML = (this.characters.length + 1).toString()
        })
    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        EventManager.getInstance().off('characterLeft', this.handleOnCharacterLeft)
        window.removeEventListener('beforeunload', this.handleOnBeforeUnload)
        EventManager.getInstance().off('characterMoved', this.handleOnCharacterMoved)
        
    }
}
