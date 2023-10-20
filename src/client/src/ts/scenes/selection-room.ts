import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { ErrorCode, MAP_ROOM} from "@root/settings";
import { Scene, SceneActivationContext } from "excalibur";

export class SelectionMenu extends Scene {
    private ui!: HTMLElement
    override onActivate(_context: SceneActivationContext<unknown>): void {
        this.ui = document.getElementById('ui')!
        this.ui.classList.add('MainMenu')

        const inputField = document.createElement('input')
        inputField.type = 'text'
        inputField.placeholder = 'GLGGLGLGL your username'
        inputField.className = 'username-input'

        const btnStart = document.createElement('button')
        btnStart.innerHTML = 'Go!'
        btnStart.className = 'button button--start'

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
        EventManager.getInstance().on('usernameError', (data: any) => {
            const errorCode = data['error']
            errorMsg.hidden = false
            console.log(errorCode)
            if (errorCode === ErrorCode.ROOM_IS_FULL)
                errorMsg.innerHTML = '*there are too many users, retry later'
            else if (errorCode === ErrorCode.USERNAME_ALREADY_EXISTS)
                errorMsg.innerHTML = '*nickname must be unique, try a different one'
        })
        EventManager.getInstance().on('usernameAccepted', () => _context.engine.goToScene(MAP_ROOM, inputField.value))

        this.ui?.appendChild(inputField)
        this.ui?.appendChild(btnStart)
        this.ui?.appendChild(errorMsg)

    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.classList.remove('MainMenu')
        this.ui.innerHTML = ''
    }
}