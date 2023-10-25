import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { ErrorCode, MAP_ROOM, MAX_USERS_PER_ROOM } from "@root/settings";
import { Scene, SceneActivationContext } from "excalibur";

export class Lobby extends Scene {
    private ui!: HTMLElement
    private roomCounter: number
    private divRoomList!: HTMLElement
    constructor() {
        super()
        this.roomCounter = 0
        this.divRoomList = document.createElement('div');
    }
    override onActivate(_context: SceneActivationContext<unknown>): void {
        //window.addEventListener('beforeunload', this.handleOnBeforeUnload.bind(this))
        const data = _context.data as { username: string, roomList: { roomName: string, nUsers: number }[] }
        console.log(data)
        const username = data.username
        this.ui = document.getElementById('ui')!;

        const pSelectionTitle = document.createElement('p');
        pSelectionTitle.className = 'selection-title';
        pSelectionTitle.innerHTML = `Hi <span id="username">${username}</span>, <br>Join a room or create a new one ^-^`;

        const divSelectionContainer = document.createElement('div');
        divSelectionContainer.className = 'selection-container';

        const divRoomListContainer = document.createElement('div');
        divRoomListContainer.className = 'roomlist-container';

        const pExistingRooms = document.createElement('p');
        pExistingRooms.textContent = 'Existing rooms';


        this.divRoomList.className = 'room-list';

        //test
        // for (let i = 0; i < 2; i++) {
        //     this.handleRoomCreated({ roomName: 'test-room' })
        // }
        //---

        const buttonJoin = document.createElement('button');
        buttonJoin.textContent = 'join!';

        divRoomListContainer.appendChild(pExistingRooms);
        divRoomListContainer.appendChild(this.divRoomList);
        divRoomListContainer.appendChild(buttonJoin);

        divSelectionContainer.appendChild(divRoomListContainer);

        const divCreationContainer = document.createElement('div');
        divCreationContainer.className = 'creation-container';

        const pNewRoom = document.createElement('p');
        pNewRoom.textContent = 'new room';

        const inputRoomName = document.createElement('input');
        inputRoomName.className = 'username-input';
        inputRoomName.type = 'text';
        inputRoomName.placeholder = 'room name';

        const buttonCreateAndJoin = document.createElement('button');
        buttonCreateAndJoin.textContent = 'create and join!';

        const errorMsg = document.createElement('p')

        errorMsg.className = 'error-msg'
        errorMsg.hidden = true

        divCreationContainer.appendChild(pNewRoom);
        divCreationContainer.appendChild(inputRoomName);
        divCreationContainer.appendChild(buttonCreateAndJoin);
        divCreationContainer.appendChild(errorMsg);

        divSelectionContainer.appendChild(divCreationContainer);
        
        this.ui.appendChild(pSelectionTitle);
        this.ui.appendChild(divSelectionContainer);

        buttonCreateAndJoin.onclick = function (e) {
            e.preventDefault()
            if (inputRoomName.value != "")
                WebSocketManager.getInstance().createRoomReq(inputRoomName.value, username)
        }

        EventManager.getInstance().on('roomCreated', this.handleRoomCreated.bind(this))
        EventManager.getInstance().on('joinAccepted', (data: {username: string, allCharacters: { username: string; position: { x: number; y: number } } [] , 'mapMatrix' : [number, number, boolean][][]}) => {
            _context.engine.goToScene(MAP_ROOM, data)
        })
        EventManager.getInstance().on('roomDeclined', (data: {error: ErrorCode}) => {
            const errorCode = data.error
            errorMsg.hidden = false
            console.log(errorCode)
            if (errorCode === ErrorCode.FULL)
                errorMsg.innerHTML = '*there are too many rooms, retry later'
            else if (errorCode === ErrorCode.ALREADY_EXISTS)
                errorMsg.innerHTML = '*roomname must be unique, try a different one'
        })
        EventManager.getInstance().on('characterLeft', this.handleCharacterLeft.bind(this))
    }

    public handleRoomCreated(data: { roomName: string }) {
        const divRoomEntry = document.createElement('div');
        divRoomEntry.className = 'room-entry';
        divRoomEntry.id = data.roomName;

        const pRoomName = document.createElement('p');
        pRoomName.id = 'room-name';
        pRoomName.textContent = data.roomName;

        const pUsers = document.createElement('p');
        pUsers.innerHTML = `<span id="n-users">1</span>/<span id="max-users">${MAX_USERS_PER_ROOM}</span>`;

        divRoomEntry.appendChild(pRoomName);
        divRoomEntry.appendChild(pUsers);

        this.divRoomList.appendChild(divRoomEntry);
        this.roomCounter++
    }

    public handleCharacterLeft(data: {roomName: string}){
        const divRoomEntry = document.getElementById(data.roomName)!
        console.log(divRoomEntry.innerHTML)
        const spanNUsers = divRoomEntry.querySelector('p span#n-users')!
        let nUsers = Number(spanNUsers.innerHTML)
        spanNUsers.innerHTML = (--nUsers).toString()

        if(nUsers <= 0){
            this.divRoomList.removeChild(divRoomEntry)
        }
        this.roomCounter--
    }



    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.innerHTML = ''
    }
}