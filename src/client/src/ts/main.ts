import { Game } from "@root/game";
import { MAINMENU, TEST_ROOM } from "@root/settings";
import { loader } from "@root/resources";

const game = new Game()
game.start(loader).then(() => {
    game.goToScene(TEST_ROOM)
})