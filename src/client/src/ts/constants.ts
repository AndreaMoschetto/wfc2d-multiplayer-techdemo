import fs from 'fs'
import yaml from 'js-yaml'

type Configuration = {
    limits: {
      users: number;
      users_per_room: number;
      rooms: number;
    };
    tile_resolution: {
      width: number;
      height: number;
    };
    rooms_log: boolean
  };
type AdjacencyRoles = Record<string, { "adjacency": string[][], "solid": boolean }>


const configs = yaml.load(fs.readFileSync('configs.yml', 'utf8')) as Configuration
const wfcRoles = JSON.parse(fs.readFileSync('adjacency-roles.json', 'utf-8')) as AdjacencyRoles

//Game settings
export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600
export const TILEMAP_ROWS = 30
export const TILEMAP_COLUMNS = 40
export const TILE_WIDTH = configs.tile_resolution.width ?? 32
export const TILE_HEIGHT = configs.tile_resolution.height ?? 32
export const ADJACENCY_ROLES = wfcRoles


//Scene names
export const MAINMENU = 'main-menu'
export const LOBBY = 'lobby'
export const MAP_ROOM = 'map-test'

//WebSocket settings
export const SERVER_ADDR = 'localhost'
export const SERVER_PORT = 7777
export const MAX_USERS = configs.limits.users ?? 10
export const MAX_USERS_PER_ROOM = configs.limits.users_per_room ?? 2
export const MAX_ROOMS = configs.limits.rooms ?? 3
export const SERVER_LOBBY = 'server-lobby'

//error codes
export enum ErrorCode{
    FULL,
    ALREADY_EXISTS
}

//debugging
export const RM_LOG = configs.rooms_log
