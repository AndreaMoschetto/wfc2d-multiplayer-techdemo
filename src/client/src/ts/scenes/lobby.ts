import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { ErrorCode, MAP_ROOM, MAX_USERS_PER_ROOM, SERVER_LOBBY } from "@root/constants";
import { Scene, SceneActivationContext } from "excalibur";

export class Lobby extends Scene {
    private username: string
    private ui!: HTMLElement
    private roomCounter: number
    private divRoomList!: HTMLElement
    private selectedRoomEntryDiv: HTMLElement | undefined;

    constructor() {
        super()
        this.username = 'nobody'
        this.roomCounter = 0
        this.divRoomList = document.createElement('div');
        this.selectedRoomEntryDiv = undefined
    }
    override onActivate(_context: SceneActivationContext<unknown>): void {
        const data = _context.data as { username: string, roomList: { roomName: string, nUsers: number }[] }
        
        this.username = data.username
        this.ui = document.getElementById('ui')!;

        const pSelectionTitle = document.createElement('p');
        pSelectionTitle.className = 'selection-title';
        pSelectionTitle.innerHTML = `Hi <span id="username">${this.username}</span>, <br>Join a room or create a new one ^-^`;

        const divSelectionContainer = document.createElement('div');
        divSelectionContainer.className = 'selection-container';

        const divRoomListContainer = document.createElement('div');
        divRoomListContainer.className = 'roomlist-container';

        const pExistingRooms = document.createElement('p');
        pExistingRooms.textContent = 'Existing rooms';


        this.divRoomList.className = 'room-list';

        data.roomList.forEach(room => {
            this.handleRoomCreated({ roomName: room.roomName }, room.nUsers)
        })

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



        buttonCreateAndJoin.onclick = (e) => {
            e.preventDefault()
            if (inputRoomName.value != "")
                WebSocketManager.getInstance().createRoomReq(inputRoomName.value, this.username)
        }

        buttonJoin.onclick = (e) => {
            e.preventDefault()
            if (this.selectedRoomEntryDiv) {
                const roomName = this.selectedRoomEntryDiv.id
                WebSocketManager.getInstance().joinReq(roomName, this.username)
            }
        }
        window.addEventListener('beforeunload', this.handleOnBeforeUnload)
        EventManager.getInstance().on('roomCreated', this.handleRoomCreated)
        EventManager.getInstance().on('joinAccepted', (data: { username: string, allCharacters: { username: string; position: { x: number; y: number } }[], 'mapMatrix': [number, number, boolean][][] }) => {
            _context.engine.goToScene(MAP_ROOM, data)
        })
        EventManager.getInstance().on('roomDeclined', (data: { error: ErrorCode }) => {
            const errorCode = data.error
            errorMsg.hidden = false
            
            if (errorCode === ErrorCode.FULL)
                errorMsg.innerHTML = '*there are too many rooms, retry later'
            else if (errorCode === ErrorCode.ALREADY_EXISTS)
                errorMsg.innerHTML = '*roomname must be unique, try a different one'
        })
        EventManager.getInstance().on('characterLeft', this.handleCharacterLeft)
        EventManager.getInstance().on('characterJoined', this.handleCharacterJoined)

    }

    public handleOnBeforeUnload = () => {
        WebSocketManager.getInstance().sendDisconnection(this.username)
    }

    public handleRoomCreated = (data: { roomName: string }, nUsers: number = 1) => {
        const divRoomEntry = document.createElement('div');
        divRoomEntry.className = 'room-entry';
        divRoomEntry.id = data.roomName;

        const pRoomName = document.createElement('p');
        pRoomName.id = 'room-name';
        pRoomName.textContent = data.roomName;

        const pUsers = document.createElement('p');
        pUsers.innerHTML = `<span id="n-users">${nUsers}</span>/<span id="max-users">${MAX_USERS_PER_ROOM}</span>`;

        divRoomEntry.appendChild(pRoomName);
        divRoomEntry.appendChild(pUsers);

        this.divRoomList.appendChild(divRoomEntry);
        this.roomCounter++

        if (nUsers >= MAX_USERS_PER_ROOM) {
            divRoomEntry.classList.add('full')
        }

        divRoomEntry.onclick = () => {
            if (this.selectedRoomEntryDiv) {
                this.selectedRoomEntryDiv.classList.remove('selected');
            }
            if (!divRoomEntry.classList.contains('full')) {
                divRoomEntry.classList.add('selected');
                this.selectedRoomEntryDiv = divRoomEntry;
            }
        }
    }

    public handleCharacterLeft = (data: { roomName: string }) => {
        if (data.roomName != SERVER_LOBBY) {
            const divRoomEntry = document.getElementById(data.roomName)!
            
            const spanNUsers = divRoomEntry.querySelector('p span#n-users')!
            let nUsers = Number(spanNUsers.innerHTML)
            spanNUsers.innerHTML = (--nUsers).toString()

            if (nUsers <= 0) {
                this.divRoomList.removeChild(divRoomEntry)
            }
            this.roomCounter--
            if (divRoomEntry.classList.contains('full')) {
                divRoomEntry.classList.remove('full')
            }
        }
    }
    public handleCharacterJoined = (data: { roomName: string }) => {
        const divRoomEntry = document.getElementById(data.roomName)!
        
        const spanNUsers = divRoomEntry.querySelector('p span#n-users')!
        let nUsers = Number(spanNUsers.innerHTML)
        spanNUsers.innerHTML = (++nUsers).toString()
        this.roomCounter++
        if (nUsers >= MAX_USERS_PER_ROOM) {
            divRoomEntry.classList.add('full')
        }
    }


    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.innerHTML = ''
        EventManager.getInstance().off('characterLeft', this.handleCharacterLeft)
        EventManager.getInstance().off('characterJoined', this.handleCharacterJoined)
        EventManager.getInstance().off('roomCreated', this.handleRoomCreated)

    }
}