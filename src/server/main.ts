import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { ErrorCode, MAX_ROOMS, MAX_USERS, MAX_USERS_PER_ROOM, SERVER_LOBBY, SERVER_PORT, TILEMAP_COLUMNS, TILEMAP_ROWS } from '../client/src/ts/constants'
import { WaveFunctionCollapse } from './wave-function-collapse'
import { readFileSync } from 'fs';
import { RoomsManager } from './rooms-manager'
console.log(process.cwd())
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(cors())
const clientPath = path.join(__dirname, '../www')
const assetsPath = path.join(__dirname, '../client/assets')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static(clientPath))
app.use(express.static(assetsPath))

let rm = new RoomsManager()
let matrix: [number, number, boolean][][] = []
let imageData = readFileSync('tilemap.png')
io.on('connection', (socket) => {

    socket.on('tilemap-req', () => { io.emit('tilemap-data', imageData) })

    socket.on('set-username-request', (data: { username: string }) => {
        if (rm.usersLength() < MAX_USERS) {
            if (!rm.existUser(data.username)) {
                console.log(`User '${data.username}' connected`)
                rm.addUser(data.username)
                socket.emit('username-accepted', { 'username': data.username, 'roomList': rm.getRoomsList() })
                if (rm.usersLengthInLobby() > 1)
                    socket.broadcast.emit('character-connected', data.username)
            }
            else socket.emit('username-declined', { 'error': ErrorCode.ALREADY_EXISTS })
        }
        else socket.emit('username-declined', { 'error': ErrorCode.FULL })
        rm.log()
    })
    socket.on('create-room-request', (data: { roomName: string, username: string }) => {
        if (rm.roomsLength() < MAX_ROOMS) {
            if (!rm.existRoom(data.roomName)) {
                let wfc = new WaveFunctionCollapse(TILEMAP_ROWS, TILEMAP_COLUMNS)
                matrix = wfc.resolve()
                const room = rm.addRoom(data.roomName, data.username, matrix)
                socket.join(data.roomName) //first user in this room
                socket.emit('join-accepted', { 'username': data.username, 'allCharacters': [], 'mapMatrix': room.matrix })
                if (rm.usersLengthInLobby() > 0)
                    socket.broadcast.emit('room-created', { 'roomName': data.roomName })
            }
            else socket.emit('room-declined', { 'error': ErrorCode.ALREADY_EXISTS })
        }
        else socket.emit('room-declined', { 'error': ErrorCode.FULL })
        rm.log()
    })

    socket.on('join-request', (data: { username: string, roomName: string }) => {
        const room = rm.getRoom(data.roomName)!
        if (rm.usersLengthInRoom(data.roomName) < MAX_USERS_PER_ROOM) {
            const allUsersInfo = rm.getAllUsersInRoom(data.roomName)
            rm.joinInRoom(data.username, data.roomName)
            socket.join(room.name)
            socket.emit('join-accepted', { 'username': data.username, 'allCharacters': allUsersInfo, 'mapMatrix': room.matrix })
            console.log(`player ${data.username} joined in room ${room.name}`)
            if (rm.usersLengthInLobby() > 0) {//to users in lobby
                socket.broadcast.emit('character-joined', data)
            }
        }
        else socket.emit('join-declined', { 'error': ErrorCode.FULL })
        rm.log()
    })
    //event not used yet
    socket.on('user-left', (data: { username: string }) => {
        const room = rm.getRoomByUser(data.username)!
        rm.leaveRoom(data.username)
        socket.leave(room.name)
        if (rm.usersLengthInRoom(room.name) > 0) {
            io.in(room.name).emit('character-left', data)
        }
        else {
            rm.deleteRoom(room.name)
        }
        if (rm.usersLengthInLobby() > 0) {
            socket.broadcast.emit('character-left', { 'roomName': room.name })
        }
        rm.log()
    })

    socket.on('user-disconnected', (data: { username: string }) => {
        const room = rm.getRoomByUser(data.username)
        rm.removeUser(data.username)
        if (room) {
            if (rm.usersLengthInRoom(room.name) > 0) {
                socket.in(room.name).emit('character-left', data)
            }
            else {
                rm.deleteRoom(room.name)
            }
            socket.leave(room.name)
        }
        if (rm.usersLengthInLobby() > 0) {
            socket.broadcast.emit('character-left', { 'roomName': room?.name ?? SERVER_LOBBY })
        }
        rm.log()
    })

    socket.on('player-moved', (data: { username: string, position: { x: number, y: number } }) => {
        //Send message to everyone in room
        const room = rm.getRoomByUser(data.username)!
        const user = rm.getUser(data.username)!
        if (room && user) {
            user.position.x = data.position.x
            user.position.y = data.position.y
            if (rm.usersLengthInRoom(room.name) > 1) {
                socket.in(room.name).emit('character-moved', data)
            }
            rm.log()
        }
    })
})
httpServer.listen(SERVER_PORT)
console.log('[listening] waiting for connections...')
rm.log()