import { RM_LOG } from "../client/src/ts/constants";

class User {
    public username: string
    public position: { x: number, y: number }

    constructor(username: string, position: { x: number, y: number } = { x: 0, y: 0 }) {
        this.username = username
        this.position = position
    }

    public exportData(): { username: string; position: { x: number; y: number } } {
        return { 'username': this.username, 'position': this.position }
    }
}

class Room {
    public name: string
    public users: User[]
    public matrix: [number, number, boolean][][]
    constructor(name: string, users: User[], matrix: [number, number, boolean][][]) {
        this.name = name
        this.users = users
        this.matrix = matrix
    }
}

export class RoomsManager {
    private lobby: User[]
    private rooms: Room[]
    constructor() {
        this.rooms = []
        this.lobby = []
    }

    public usersLength(): number {
        let count = this.lobby.length
        this.rooms.forEach(room => { count += room.users.length })
        return count
    }
    public usersLengthInRoom(roomName: string): number {
        return this.rooms.filter(a => a.name === roomName).pop()!.users.length
    }
    public usersLengthInLobby(): number {
        return this.lobby.length
    }
    public roomsLength(): number {
        return this.rooms.length
    }
    public getUser(username: string): User | undefined {
        let user: User | undefined = this.lobby.filter(a => a.username === username).pop()
        if (user === undefined)
            this.rooms.forEach(room => {
                user = room.users.filter(a => a.username === username).pop()
            })
        return user
    }
    public existUser(username: string): boolean {
        return this.getUser(username) != undefined
    }
    public getRoomsList(): { roomName: string, nUsers: number }[] {
        let roomsList: { roomName: string, nUsers: number }[] = []
        this.rooms.forEach(room => {
            roomsList.push({ roomName: room.name, nUsers: room.users.length })
        })
        return roomsList
    }

    public getRoom(roomName: string): Room | undefined {
        return this.rooms.filter(a => a.name === roomName).pop()
    }
    public getRoomByUser(username: string): Room | undefined {
        let foundRoom: Room | undefined
        this.rooms.forEach(room => {
            if (room.users.filter(user => user.username === username).length == 1) {
                foundRoom = room
            }
        })
        return foundRoom
    }
    public existRoom(room: string): boolean {
        return this.getRoom(room) != undefined
    }
    public addUser(username: string) {
        this.lobby.push(new User(username))
    }
    public addRoom(roomName: string, username: string, matrix: [number, number, boolean][][]): Room {
        const room = new Room(roomName, [this.getUser(username)!], matrix)
        this.rooms.push(room)
        this.lobby = this.lobby.filter(a => a.username !== username)
        return room
    }
    public joinInRoom(username: string, roomName: string) {
        let user = this.getUser(username)!
        this.rooms.filter(a => a.name === roomName).pop()!.users.push(user)
        this.lobby = this.lobby.filter(a => a.username !== username)
    }
    public getAllUsersInRoom(roomName: string): { username: string; position: { x: number; y: number } }[] {
        const data: { username: string; position: { x: number; y: number } }[] = []
        this.getRoom(roomName)!.users.forEach(user => data.push(user.exportData()))
        return data
    }
    public leaveRoom(username: string) {
        let room = this.getRoomByUser(username)!
        let user = this.getUser(username)!
        room.users = room.users.filter(a => a.username !== username)
        this.lobby.push(user)
    }

    public deleteRoom(roomName: string) {
        this.rooms = this.rooms.filter(a => a.name !== roomName)
    }

    public removeUser(username: string) {
        this.lobby = this.lobby.filter(a => a.username !== username)
        let room = this.getRoomByUser(username)
        if (room)
            room.users = room.users.filter(a => a.username !== username)
    }
    public log() {
        if (RM_LOG) {
            console.log('\n\n\n\n\n')
            console.log('[ROOMS]')
            console.log('-----------[LOBBY]:')
            this.lobby.forEach(user => console.log(`${user.username} {x: ${user.position.x}; y: ${user.position.y}}`))
            this.rooms.forEach(room => {
                console.log(`-----------[${room.name}]:`)
                room.users.forEach(user => console.log(`${user.username} {x: ${user.position.x}; y: ${user.position.y}}`))
            })
            console.log('------------------[]')
        }
    }
}