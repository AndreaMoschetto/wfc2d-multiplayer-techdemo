import { Vector } from "excalibur"
import { io, Socket } from "socket.io-client"
import { SERVER_ADDR, SERVER_PORT } from "@root/settings"

export class WebSocketManager {
    private static instance: WebSocketManager


    private port: number
    private ipaddr: string
    private io: Socket
    constructor(_ipaddr: string, _port: number) {
        this.port = _port;
        this.ipaddr = _ipaddr;
        this.io = io(`http://${this.ipaddr}:${this.port}`)

        this.io.on('newmsg', (data) => {
            console.log(`user: ${data.username} is at\nx:${data.position.x}\ny:${data.position.y}`)
        })
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

    public sendPosition(username: string, position: Vector) {
        this.io.emit('msg', { 'username': username, 'position': { 'x': position.x, 'y': position.y } })
    }
}