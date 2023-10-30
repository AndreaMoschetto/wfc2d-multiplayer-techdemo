import { Game } from "@root/game";
import { MAINMENU, MAX_USERS_PER_ROOM, GAME_HEIGHT, GAME_WIDTH } from "@root/constants";
import { loader } from "@root/resources";

document.getElementById('player-limit')!.innerHTML = MAX_USERS_PER_ROOM.toString()
document.getElementById('ui')!.setAttribute('style',`height:${GAME_HEIGHT};width:${GAME_WIDTH}`)

const game = new Game()
game.start(loader).then(() => {
    game.goToScene(MAINMENU)
})