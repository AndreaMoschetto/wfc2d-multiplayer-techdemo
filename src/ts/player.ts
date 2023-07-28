import { Actor, Color, Engine, Input } from "excalibur";

export class Player extends Actor {
    private speed: number

    constructor(speed: number) {
        super({
            x: 25,
            y: 25,
            width: 25,
            height: 25,
            color: Color.White
        })
        this.speed = speed
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

        //normalize diagonal movement
        if (xMovement !== 0 || yMovement !== 0) {
            const length = Math.sqrt(xMovement * xMovement + yMovement * yMovement);
            xMovement /= length;
            yMovement /= length;
        }

        this.pos.x += xMovement * this.speed * _delta / 1000;
        this.pos.y += yMovement * this.speed * _delta / 1000;
    }
}