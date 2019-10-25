import { Socket } from 'socket.io';
import * as uuid4 from 'uuid4';
import { IGameEvent } from './game-event.model';
import { GameMap, ISize } from './game-map.model';

export interface IUser {
    id: string;
    name: string;
}

export interface IGamer extends IUser {
    isConnected: boolean;
    color?: string;
}

export interface IGameInfoResponse {
    id: string;
    name: string;
    hostId: string;
    gamers: Array<[string, IGamer]>;
    size: ISize;
    state: GameState;

    gameMap: GameMap;
    currentUserId: string;
    tmpCurrentUserId: string;
    events: IGameEvent[];
}

export enum GameState {
    WAITING = 'WAITING',
    STARTED = 'STARTED',
    FINISHED = 'FINISHED',
}

export interface IEventResponse {
    isNext: boolean;
    tmpId: string;
}

export const GAME_COLORS = [
    'white', 'green', 'purple', 'cyan', 'red', 'black', // первые 6 цветов
    'indigo', 'yellow', 'violet',
];

export class GameInfo implements IGameInfoResponse {

    private GameId: string;
    private Name: string;
    private HostId: string;
    private Gamers: Map<string, IGamer>;
    private State: GameState;
    private Size: ISize;

    public gameMap: GameMap;
    public currentUserId: string;
    public tmpCurrentUserId: string;
    public events: IGameEvent[];

    get id() { return this.GameId; }
    get name() { return this.Name; }
    get hostId() { return this.HostId; }
    get size() { return this.Size; }
    get state() { return this.State; }
    get gamers() { return Array.from(this.Gamers); }
    get response(): IGameInfoResponse { return {
        id: this.id,
        name: this.name,
        hostId: this.hostId,
        gamers: this.gamers,
        size: this.size,
        state: this.state,
        gameMap: this.gameMap,
        currentUserId: this.currentUserId,
        tmpCurrentUserId: this.tmpCurrentUserId,
        events: this.events,
    }; }

    constructor(name: string, hostId: string, size: ISize, socket?: Socket) {
        this.GameId = uuid4();
        this.Name = name;
        this.HostId = hostId;
        this.Gamers = new Map();
        this.Size = size;
        this.State = GameState.WAITING;
        if (socket) { socket.join(this.GameId); }
    }

    joinUser(socket: Socket, user: IUser) {
        if (this.State === GameState.WAITING) {
            this.Gamers.set(user.id, { ...user, isConnected: true });
        } else if (this.Gamers.has(user.id)) {
            const gamer = this.Gamers.get(user.id);
            gamer.isConnected = true;
        } else {
            return false;
        }
        socket.join(this.GameId);
        return true;
    }

    leaveUser(socket: Socket, user: IUser) {
        if (this.State === GameState.WAITING) {
            this.Gamers.delete(user.id);
        } else if (this.Gamers.has(user.id)) {
            const gamer = this.Gamers.get(user.id);
            gamer.isConnected = false;
        } else {
            return false;
        }
        socket.leave(this.GameId);
        return true;
    }

    getUser(id: string) {
        if (this.Gamers.has(id)) {
            return this.Gamers.get(id);
        } else {
            return null;
        }
    }

    toUsers(socket: Socket) {
        return socket.broadcast.to(this.GameId);
    }

    // TODO: start
    start(socket: Socket) {
        this.State = GameState.STARTED;
        let index = 0;
        for (const gamer of this.Gamers.values()) {
            gamer.color = GAME_COLORS[index];
            index++;
        }
        this.gameMap = new GameMap(this.Size);
        this.currentUserId = this.hostId;
        this.toUsers(socket).emit('GameStarted', this.response);
        socket.emit('GameStarted', this.response);
    }

    // TODO: event
    event(socket: Socket, event: IGameEvent) {
        this.gameMap.mapEvent(event);
        this.toUsers(socket).emit('GameEvent', event);
        socket.emit('GameEvent', event);
    }

    // TODO: finish
    finish(socket: Socket) {
        this.State = GameState.FINISHED;
        this.toUsers(socket).emit('GameFinished', this.response);
        socket.emit('GameFinished', this.response);
    }

}
