import { Color, Engine, Input } from "excalibur";
import { MainMenu } from "@root/scenes/main-menu";
import { MAINMENU, RES_HEIGHT as GAME_HEIGHT, RES_WIDTH as GAME_WIDTH, MAP_ROOM, SELECTION_MENU as SELECTION_MENU } from "@root/settings";
import { MapTest } from "./scenes/map-test";
import { SelectionMenu } from "./scenes/selection-room";

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
        this.addScene(SELECTION_MENU, new SelectionMenu)
    }
}


