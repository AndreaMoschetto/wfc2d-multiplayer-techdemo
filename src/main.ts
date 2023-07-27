import { ROOM } from "./constants";
import { Game } from "./game";

const game = new Game()
game.start().then(() => {
    game.goToScene(ROOM)
})