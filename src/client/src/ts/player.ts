import { Actor, Color, Engine, Input, Label, Vector, vec } from "excalibur";
import { WebSocketManager } from "./websocket-manager";

export class Player extends Actor {
    private speed: number
    private text: Label

    constructor(username: string) {
        super({
            name: username,
            width: 25,
            height: 25,
            color: Color.White
        })
        this.speed = 200;
        this.text = new Label({
            y:-17,
            text: this.name,
            color: Color.White
        })
    }

    override onInitialize(_engine: Engine): void {
        this.pos = vec(100,100)
        this.text.pos = new Vector(-this.text.getTextWidth() / 2, this.text.pos.y);
        this.addChild(this.text)

        WebSocketManager.getInstance().sendMessage(this.name, this.pos)
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
        
        WebSocketManager.getInstance().sendMessage(this.name, this.pos)
    }
}