import { Scene, SceneActivationContext } from "excalibur";
import { Player } from "@root/characters/player";
import { Character } from "@root/characters/character";
import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";

export class Room extends Scene {
    protected player!: Player
    private characters: Character[]
    private playerCounter: HTMLElement

    constructor() {
        super()
        this.characters = []
        this.playerCounter = document.getElementById("player-counter")!
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        EventManager.getInstance().on('characterMoved', this.handleOnCharacterMoved.bind(this))
        EventManager.getInstance().on('allCharacters', this.handleOnAllCharacters.bind(this))
        window.addEventListener('beforeunload', this.handleOnBeforeUnload.bind(this))
        EventManager.getInstance().on('characterDisconnected', this.handleOnCharacterDisconnected.bind(this))

        this.player = new Player(<string>_context.data)
        this.playerCounter.innerHTML = '1'

        //this.add(this.player)
    }

    public handleOnBeforeUnload(){
        WebSocketManager.getInstance().sendDisconnection(this.player.name)
    }
    public handleOnCharacterDisconnected(data: any){
        const character = this.characters.filter(elem => elem.name === data['username']).pop()!
        this.remove(character)
        this.characters = this.characters.filter(elem => elem !== character)
        this.playerCounter.innerHTML = (this.characters.length + 1).toString()
    }

    public handleOnAllCharacters(data: any) {
        data.forEach((characterInfo: { username: string, position: { x: number, y: number } }) => {
            const username = characterInfo.username
            const x = characterInfo.position.x
            const y = characterInfo.position.y

            let character = new Character(username, x, y)
            this.add(character)
            this.characters.push(character)
        });
        this.playerCounter.innerHTML = (this.characters.length + 1).toString()
    }

    public handleOnCharacterMoved(data: any) {
        const username: string = data.username
        const x: number = data.position.x
        const y: number = data.position.y

        let character = this.characters.find(a => a.name === username)

        if (!character) {
            character = new Character(username)
            this.add(character)
            this.characters.push(character)
            this.playerCounter.innerHTML = (this.characters.length + 1).toString()
        }
        character.pos.setTo(x, y)
    }
}
