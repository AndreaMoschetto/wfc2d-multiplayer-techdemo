import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(cors())
const clientPath = path.join(__dirname, 'www')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static(clientPath))
const users: any = []
io.on('connection', (socket) => {
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
        io.sockets.emit('newmsg', data)
    })
})
httpServer.listen(7777)
console.log('[listening] waiting for connections...')