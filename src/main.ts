import { Engine } from "excalibur";
import { Player } from "./player";

const game = new Engine({width:800, height:600})

const player = new Player(200)
game.add(player)

game.start()