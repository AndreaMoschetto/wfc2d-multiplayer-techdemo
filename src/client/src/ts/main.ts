import { Game } from "@root/game";
import { MAINMENU } from "@root/settings";

const game = new Game()
game.start().then(() => {
    game.goToScene(MAINMENU)
})