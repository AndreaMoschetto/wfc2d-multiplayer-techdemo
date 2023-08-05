import { ROOM } from "@root/settings";
import { Scene, SceneActivationContext } from "excalibur";

export class MainMenu extends Scene {
    private ui: HTMLElement
    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.ui = document.getElementById('ui') ?? new HTMLElement()
        this.ui.classList.add('MainMenu')

        const inputField = document.createElement('input')
        inputField.type='text'
        inputField.placeholder='write your username'
        inputField.className= 'username-input'

        const btnStart = document.createElement('button')
        btnStart.innerHTML = 'Go!'
        btnStart.className = 'button button--start'
        btnStart.onclick = (e) => {
            e.preventDefault()
            _context.engine.goToScene(ROOM, inputField.value)
        }

        this.ui?.appendChild(inputField)
        this.ui?.appendChild(btnStart)

    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.classList.remove('MainMenu')
        this.ui.innerHTML = ''
    }
}