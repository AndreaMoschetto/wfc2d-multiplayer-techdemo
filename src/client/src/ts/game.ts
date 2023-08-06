import { Color, Engine, Input } from "excalibur";
import { MainMenu } from "@root/scenes/main-menu";
import { Room } from "@root/scenes/room";
import { MAINMENU, RES_HEIGHT as GAME_HEIGHT, RES_WIDTH as GAME_WIDTH, ROOM } from "@root/settings";

export class Game extends Engine {
    constructor() {
        super({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            canvasElementId: 'game',
            backgroundColor: Color.Black,
            pointerScope: Input.PointerScope.Canvas
        })
        this.addScene(MAINMENU, new MainMenu())
        this.addScene(ROOM, new Room())
    }
}


