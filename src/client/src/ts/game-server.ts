import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'

export class GameServer {
    private app = express()
    private httpServer = createServer(this.app)
    private io = new Server(this.httpServer)

    constructor() {
        this.app.use(cors())
        this.app.use(express.static("./www"))
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(express.json())

        const users: any = []
        this.io.on('connection', (socket) => {
            console.log('A user connected')
            socket.on('setUsername', (data) => {
                console.log(data); if (users.indexOf(data) > -1) {
                    socket.emit('userExists', data + ' username is taken! Try some other username.')
                } else {
                    users.push(data)
                    socket.emit('userSet', { username: data })
                }
            });
            socket.on('msg', (data) => {
                //Send message to everyone
                console.log(data)
                this.io.sockets.emit('newmsg', data)
            })
        })
        this.io.listen(1234)
        console.log('[listening] waiting for connections...')
    }


}