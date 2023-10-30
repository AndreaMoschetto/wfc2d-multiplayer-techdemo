import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { ErrorCode, LOBBY} from "@root/constants";
import { Scene, SceneActivationContext } from "excalibur";

export class MainMenu extends Scene {
    private ui!: HTMLElement
    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.ui = document.getElementById('ui')!

        const inputField = document.createElement('input')
        inputField.type = 'text'
        inputField.placeholder = 'write your username'
        inputField.className = 'username-input'

        const btnStart = document.createElement('button')
        btnStart.innerHTML = 'Go!'
        btnStart.className = 'button'

        const errorMsg = document.createElement('p')

        errorMsg.className = 'error-msg'
        errorMsg.hidden = true
        document.addEventListener('keydown', (event) => {
            if(event.key === 'Enter'){
                btnStart.click()
            }
        })
        btnStart.onclick = function (e) {
            e.preventDefault()
            if (inputField.value != "")
                WebSocketManager.getInstance().setUsername(inputField.value)
        }
        EventManager.getInstance().on('usernameDeclined', (data: {error: ErrorCode}) => {
            const errorCode = data.error
            errorMsg.hidden = false
            if (errorCode === ErrorCode.FULL)
                errorMsg.innerHTML = '*there are too many users, retry later'
            else if (errorCode === ErrorCode.ALREADY_EXISTS)
                errorMsg.innerHTML = '*nickname must be unique, try a different one'
        })
        EventManager.getInstance().on('usernameAccepted', (data: any) => _context.engine.goToScene(LOBBY, data))

        this.ui?.appendChild(inputField)
        this.ui?.appendChild(btnStart)
        this.ui?.appendChild(errorMsg)

    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.classList.remove('MainMenu')
        this.ui.innerHTML = ''
    }
}