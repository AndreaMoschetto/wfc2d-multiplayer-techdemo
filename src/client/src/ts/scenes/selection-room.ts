import { EventManager } from "@root/managers/event-manager";
import { WebSocketManager } from "@root/managers/websocket-manager";
import { ErrorCode, MAP_ROOM, MAX_USERS_PER_ROOM } from "@root/settings";
import { Scene, SceneActivationContext } from "excalibur";

export class SelectionMenu extends Scene {
    private ui!: HTMLElement
    override onActivate(_context: SceneActivationContext<unknown>): void {
        const username = <string>_context.data
        const ui = document.getElementById('ui')!;

        const pSelectionTitle = document.createElement('p');
        pSelectionTitle.className = 'selection-title';
        pSelectionTitle.innerHTML = `Hi <span id="username">${username}</span>, <br>Join a room or create a new one ^-^`;

        const divSelectionContainer = document.createElement('div');
        divSelectionContainer.className = 'selection-container';

        const divRoomListContainer = document.createElement('div');
        divRoomListContainer.className = 'roomlist-container';

        const pExistingRooms = document.createElement('p');
        pExistingRooms.textContent = 'Existing rooms';

        const divRoomList = document.createElement('div');
        divRoomList.className = 'room-list';

        for (let i = 0; i < 1; i++) {
            const divRoomEntry = document.createElement('div');
            divRoomEntry.className = 'room-entry';
            divRoomEntry.id = i.toString();

            const pRoomName = document.createElement('p');
            pRoomName.id = 'room-name';
            pRoomName.textContent = 'room_name';

            const pUsers = document.createElement('p');
            pUsers.innerHTML = `<span id="n-users">0</span>/<span id="max-users">${MAX_USERS_PER_ROOM}</span>`;

            divRoomEntry.appendChild(pRoomName);
            divRoomEntry.appendChild(pUsers);

            divRoomList.appendChild(divRoomEntry);
        }

        const buttonJoin = document.createElement('button');
        buttonJoin.textContent = 'join!';

        divRoomListContainer.appendChild(pExistingRooms);
        divRoomListContainer.appendChild(divRoomList);
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

        divCreationContainer.appendChild(pNewRoom);
        divCreationContainer.appendChild(inputRoomName);
        divCreationContainer.appendChild(buttonCreateAndJoin);

        divSelectionContainer.appendChild(divCreationContainer);

        ui.appendChild(pSelectionTitle);
        ui.appendChild(divSelectionContainer);

    }

    override onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.ui.innerHTML = ''
    }
}