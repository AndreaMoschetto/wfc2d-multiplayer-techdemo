import { ROOM } from "./constants";
import { Game } from "./game";
//import { GameServer } from "./game-server";

//const server = new GameServer()

const game = new Game()
game.start().then(() => {
    game.goToScene(ROOM)
})