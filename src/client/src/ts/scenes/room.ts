import { Scene, SceneActivationContext } from "excalibur";
import { Player } from "@root/characters/player";
import { Character } from "@root/characters/character";
import { EventManager } from "@root/managers/event-manager";

export class Room extends Scene {
    protected player!: Player
    private characters: Character[]

    constructor(){
        super()
        this.characters = []
        
    }

    override onActivate(_context: SceneActivationContext<unknown>): void {
        EventManager.getInstance().on('characterMoved', this.handleOnUserMoved.bind(this))
        EventManager.getInstance().on('allCharacters', this.handleOnAllCharacters.bind(this))
        this.player = new Player(<string>_context.data)
        //this.add(this.player)
    }

    public handleOnAllCharacters(data: any){
        data.forEach((characterInfo: { username: string, position: { x: number, y: number }}) => {
            const username = characterInfo.username
            const x = characterInfo.position.x
            const y = characterInfo.position.y

            let character = new Character(username, x, y)
            //character.pos.setTo(x, y)
            this.add(character)
            this.characters.push(character)
        });
    }

    public handleOnUserMoved(data: any){
        const username: string = data.username
        const x: number = data.position.x
        const y: number = data.position.y
        
        let character = this.characters.find(a => a.name === username)
    
        if(!character){
            character = new Character(username)
            this.add(character)
            this.characters.push(character)
        }
        character.pos.setTo(x,y)
    }
}
