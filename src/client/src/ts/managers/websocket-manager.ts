import { Vector } from "excalibur"
import { io, Socket } from "socket.io-client"
import { SERVER_PORT } from "@root/constants"
import { EventManager } from "@root/managers/event-manager"

export class WebSocketManager {
    private static instance: WebSocketManager


    private port: number
    private ipaddr: string
    private io: Socket
    constructor(_ipaddr: string, _port: number) {
        this.port = _port;
        this.ipaddr = _ipaddr;
        this.io = io(`http://${this.ipaddr}:${this.port}`)

        this.io.on('character-moved', (data) => { EventManager.getInstance().emit('characterMoved', data) })
        this.io.on('allCharacters', (data) => { EventManager.getInstance().emit('allCharacters', data) })
        this.io.on('map-response', (data) => { EventManager.getInstance().emit('mapGenerated', data) })
        this.io.on('character-joined', (data) => { EventManager.getInstance().emit('characterJoined', data) })
        this.io.on('character-left', (data) => { EventManager.getInstance().emit('characterLeft', data) })
        this.io.on('username-accepted', (data) => { EventManager.getInstance().emit('usernameAccepted', data) })
        this.io.on('username-declined', (data) => { EventManager.getInstance().emit('usernameDeclined', data) })
        this.io.on('room-accepted', (data) => { EventManager.getInstance().emit('roomAccepted', data) })
        this.io.on('room-created', (data) => { EventManager.getInstance().emit('roomCreated', data) })
        this.io.on('join-accepted', (data) => { EventManager.getInstance().emit('joinAccepted', data) })
        this.io.on('room-declined', (data) => { EventManager.getInstance().emit('roomDeclined', data) })
        this.io.on('tilemap-data', (data) => {EventManager.getInstance().emit('tilemapData', data)})

    }

    public static getInstance(
        _ipaddr: string = window.location.hostname,
        _port: number = SERVER_PORT
    ): WebSocketManager {
        if (!this.instance) {
            this.instance = new WebSocketManager(_ipaddr, _port)
        }
        return this.instance
    }

    public tileMapRequest(){
        this.io.emit('tilemap-req')
    }

    public createRoomReq(roomName: string, username: string){
        const data: { roomName: string, username: string} = {
            roomName: roomName,
            username: username
        }
        this.io.emit('create-room-request', data)
    }

    public joinReq(roomName: string, username: string){
        const data: { roomName: string, username: string} = {
            roomName: roomName,
            username: username
        }
        this.io.emit('join-request', data)
    }

    public setUsername(username: string) {
        this.io.emit('set-username-request', { 'username': username })
    }

    public sendPosition(username: string, position: Vector) {
        const data = {
            username: username, position: { x: position.x, y: position.y }
        }
        this.io.emit('player-moved', data)
    }

    public sendMapRequest(height: number, width: number) {
        const data = {
            'tilemapRows': height,
            'tilemapColumns': width,
        }
        this.io.emit('map-request', data)
    }
    public sendDisconnection(username: string) {
        this.io.emit('user-disconnected', { 'username': username })
    }
}