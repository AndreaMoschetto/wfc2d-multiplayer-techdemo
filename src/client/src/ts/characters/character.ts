import { Actor, Color, Engine, Label, Vector, vec } from "excalibur";

export class Character extends Actor {
    private text: Label
    constructor(name: string, x: number = 100, y: number = 100) {
        super({
            name: name,
            pos: vec(x, y),
            width: 10,
            height: 10,
            color: Color.fromRGB(
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256))
        });
        this.text = new Label({
            y: -17,
            text: this.name,
            color: Color.White,
        })
    }
    override onInitialize(_engine: Engine): void {
        this.text.pos = new Vector(-this.text.getTextWidth() / 2, this.text.pos.y);
        this.addChild(this.text)
    }

}   