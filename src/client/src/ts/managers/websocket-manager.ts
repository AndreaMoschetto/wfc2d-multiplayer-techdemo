import { Vector } from "excalibur"
import { io, Socket } from "socket.io-client"
import { SERVER_ADDR, SERVER_PORT } from "@root/settings"
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

        this.io.on('character-move', (data) => { EventManager.getInstance().emit('characterMoved', data) })
        this.io.on('allCharacters', (data) => { EventManager.getInstance().emit('allCharacters', data) })
        this.io.on('map-response', (data) => { EventManager.getInstance().emit('mapGenerated', data) })
        this.io.on('character-disconnected', (data) => { EventManager.getInstance().emit('characterDisconnected', data) })
        this.io.on('username-accepted', () => { EventManager.getInstance().emit('usernameAccepted') })
        this.io.on('username-error', (data) => { EventManager.getInstance().emit('usernameError', data) })
    }

    public static getInstance(
        _ipaddr: string = SERVER_ADDR,
        _port: number = SERVER_PORT
    ): WebSocketManager {
        if (!this.instance) {
            this.instance = new WebSocketManager(_ipaddr, _port)
        }
        return this.instance
    }

    public setUsername(username: string) {
        this.io.emit('set-username', { 'username': username })
    }

    public sendPosition(username: string, position: Vector) {
        const data = {
            'username': username, 'position': { 'x': position.x, 'y': position.y }
        }
        this.io.emit('player-move', data)
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