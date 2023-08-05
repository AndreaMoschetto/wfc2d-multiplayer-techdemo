import { Color, Engine, Input } from "excalibur";
import { MainMenu } from "@root/scenes/main-menu";
import { Room } from "@root/scenes/room";
import { MAINMENU, ROOM } from "@root/settings";

export class Game extends Engine {
    constructor() {
        super({
            width: 800,
            height: 600,
            canvasElementId: 'game',
            backgroundColor: Color.Black,
            pointerScope: Input.PointerScope.Canvas
        })
        this.addScene(MAINMENU, new MainMenu())
        this.addScene(ROOM, new Room())
    }
}


