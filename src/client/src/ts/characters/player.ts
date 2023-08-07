import {Engine, Input} from "excalibur";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { Character } from "@root/characters/character";

export class Player extends Character {
    private speed: number

    constructor(name: string) {
        super(name)
        this.speed = 200;
    }

    override onInitialize(_engine: Engine): void {
        super.onInitialize(_engine)
        this.pos.setTo(100,100)
        WebSocketManager.getInstance().sendPosition(this.name, this.pos)
    }

    

    override onPostUpdate(_engine: Engine, _delta: number): void {
        let xMovement = 0;
        let yMovement = 0;

        if (_engine.input.keyboard.isHeld(Input.Keys.W)) {
            yMovement -= 1;
        }
        if (_engine.input.keyboard.isHeld(Input.Keys.A)) {
            xMovement -= 1;
        }
        if (_engine.input.keyboard.isHeld(Input.Keys.S)) {
            yMovement += 1;
        }
        if (_engine.input.keyboard.isHeld(Input.Keys.D)) {
            xMovement += 1;
        }

        // normalize diagonal movement
        if (xMovement !== 0 || yMovement !== 0) {
            const length = Math.sqrt(xMovement * xMovement + yMovement * yMovement);
            xMovement /= length;
            yMovement /= length;
        }

        this.pos.x += xMovement * this.speed * _delta / 1000;
        this.pos.y += yMovement * this.speed * _delta / 1000;
        
        if (xMovement !== 0 || yMovement !== 0) 
            WebSocketManager.getInstance().sendPosition(this.name, this.pos)
    }
}