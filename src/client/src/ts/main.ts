import { Game } from "@root/game";
import { MAINMENU, MAX_USERS } from "@root/settings";
import { loader } from "@root/resources";

document.getElementById('player-limit')!.innerHTML = MAX_USERS.toString()
const game = new Game()
game.start(loader).then(() => {
    game.goToScene(MAINMENU)
})