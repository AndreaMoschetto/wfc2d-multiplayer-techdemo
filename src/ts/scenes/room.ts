import { Scene, SceneActivationContext } from "excalibur";
import { Player } from "../player";

export class Room extends Scene {
    private player: Player | null = null

    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.player = new Player(200)
        this.add(this.player)
    }
}
