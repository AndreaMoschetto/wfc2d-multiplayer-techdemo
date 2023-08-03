import { Game } from "@root/game";
import { ROOM } from "@root/settings";

const game = new Game()
game.start().then(() => {
    game.goToScene(ROOM)
})