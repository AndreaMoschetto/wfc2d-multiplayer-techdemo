import { ROOM } from "@settings";
import { Game } from "@root/game";

const game = new Game()
game.start().then(() => {
    game.goToScene(ROOM)
})