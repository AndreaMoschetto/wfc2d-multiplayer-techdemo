import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { MAP_TEST, ROOM } from "@root/settings";
import { Scene, SceneActivationContext } from "excalibur";

export class MainMenu extends Scene {
    private ui!: HTMLElement
    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.ui = document.getElementById('ui')!
        this.ui.classList.add('MainMenu')

        const inputField = document.createElement('input')
        inputField.type='text'
        inputField.placeholder='write your username'
        inputField.className= 'username-input'

        const btnStart = document.createElement('button')
        btnStart.innerHTML = 'Go!'
        btnStart.className = 'button button--start'

        const errorMsg = document.createElement('p')
        errorMsg.innerHTML = '*nickname must be unique, try a different one'
        errorMsg.className = 'error-msg'
        errorMsg.hidden = true

        btnStart.onclick = function (e){
            e.preventDefault()
            WebSocketManager.getInstance().setUsername(inputField.value)
        }
        EventManager.getInstance().on('usernameError', () => errorMsg.hidden = false)
        EventManager.getInstance().on('usernameAccepted', () => _context.engine.goToScene(MAP_TEST, inputField.value))

        this.ui?.appendChild(inputField)
        this.ui?.appendChild(btnStart)
        this.ui?.appendChild(errorMsg)

    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.classList.remove('MainMenu')
        this.ui.innerHTML = ''
    }
}