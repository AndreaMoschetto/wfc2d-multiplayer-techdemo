import { Scene, SceneActivationContext } from "excalibur";
import { Player } from "@root/characters/player";

export class Room extends Scene {
    private player: Player | null = null

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.player = new Player(<string>_context.data)
        this.add(this.player)
    }
}
