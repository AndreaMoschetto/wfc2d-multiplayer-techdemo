import { Color, Engine, Input } from "excalibur";
import { MainMenu } from "@root/scenes/main-menu";
import { MAINMENU, GAME_HEIGHT, GAME_WIDTH, MAP_ROOM, LOBBY } from "@root/constants";
import { MapTest } from "./scenes/map-test";
import { Lobby } from "./scenes/lobby";

export class Game extends Engine {
    constructor() {
        super({
            viewport: { width: GAME_WIDTH, height: GAME_HEIGHT },
            canvasElementId: 'game',
            backgroundColor: Color.Black,
            pointerScope: Input.PointerScope.Canvas,
            suppressHiDPIScaling: false
        })
        this.addScene(MAINMENU, new MainMenu())
        this.addScene(MAP_ROOM, new MapTest())
        this.addScene(LOBBY, new Lobby())
    }
}


