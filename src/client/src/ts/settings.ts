//Game settings
export const RES_WIDTH = 800
export const RES_HEIGHT = 600

//Scene names
export const MAINMENU = 'main-menu'
export const SELECTION_ROOM = 'selection-menu'
export const MAP_ROOM = 'map-test'

//WebSocket settings
export const SERVER_ADDR = 'localhost'
export const SERVER_PORT = 7777
export const MAX_USERS = 2

//error codes
export enum ErrorCode{
    ROOM_IS_FULL,
    USERNAME_ALREADY_EXISTS
}