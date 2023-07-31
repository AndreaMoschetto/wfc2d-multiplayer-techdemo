import { io, Socket } from "socket.io-client"

class WebSocketManager {
    private port: number
    private ipaddr: string
    private io: Socket
    constructor(_ipaddr: string, _port: number) {
        this.port = _port
        this.ipaddr = _ipaddr

        this.io = io(`http://${this.ipaddr}:${this.port}`)
    }
}