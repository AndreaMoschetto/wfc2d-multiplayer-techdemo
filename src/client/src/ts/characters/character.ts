import { Actor, Color, Engine, Label, Vector, vec } from "excalibur";

export class Character extends Actor {
    private text: Label
    constructor(name: string) {
        super({
            name: name,
            width: 25,
            height: 25,
            color: Color.White
        });
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
    }

}   