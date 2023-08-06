import { EntityManager, Scene, SceneActivationContext, vec } from "excalibur";
import { Player } from "@root/characters/player";
import { Character } from "@root/characters/character";
import { EventManager } from "@root/managers/event-manager";

export class Room extends Scene {
    private player: Player | null = null
    private characters: Character[]

    constructor(){
        super()
        this.characters = []
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        EventManager.getInstance().on('userMoved', this.handleOnUserMoved.bind(this))
        this.player = new Player(<string>_context.data)
        this.add(this.player)
    }

    public handleOnUserMoved(data: any){
        const username: string = data.username
        const x: number = data.position.x
        const y: number = data.position.y
        console.log('username: ' + username)
        let character = this.characters.find(a => a.name === username)
        console.log('characters contains: ' + this.characters.length + ' so: ')
        this.characters.forEach(c => {
            console.log(c.name)
            console.log(c.pos)
        });
        console.log('character: ' + character)
        if(!character){
            character = new Character(username)
            this.add(character)
            this.characters.push(character)
        }
        character.pos.setTo(x,y)
        console.log(`HANDLED EVENT: character ${username} moved in position (${x}, ${y})`)
    }
}
