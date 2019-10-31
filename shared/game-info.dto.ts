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
    isDeath: false;
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
    tmpEvents: IGameEvent[];
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
    tmpEvents?: IGameEvent[];
}

export const GAME_COLORS = [
    'white', 'green', 'purple', 'cyan', 'red', 'black', // первые 6 цветов
    'indigo', 'yellow', 'violet',
];

export interface IGameInfoOption {
    isFrontend: boolean;
    // FRONTEND
    frontendDTO?: IGameInfoResponse;
    // BACKEND
    backendDTO?: IGameInfoBackendDTO;
}

export interface IGameInfoBackendDTO {
    name: string,
    hostId: string,
    size: ISize,
    socket?: Socket
}

export class GameInfo implements IGameInfoResponse {

    public GameId: string;
    public Name: string;
    public HostId: string;
    public Gamers: Map<string, IGamer>;
    public State: GameState;
    public Size: ISize;

    public gameMap: GameMap;
    public currentUserId: string;
    public tmpCurrentUserId: string;
    public tmpEvents: IGameEvent[];
    public events: IGameEvent[];

    public message: string;



    constructor(option: IGameInfoOption) {
        if (option.isFrontend) {
            this.initFrontend(option.frontendDTO);
        } else {
            this.initBackend(option.backendDTO);
        }
    }

    initBackend(dto: IGameInfoBackendDTO) {
        this.GameId = uuid4();
        this.Name = dto.name;
        this.HostId = dto.hostId;
        this.Gamers = new Map();
        this.Size = dto.size;
        this.State = GameState.WAITING;
        if (dto.socket) { dto.socket.join(this.GameId); }
    }

    initFrontend(dto: IGameInfoResponse) {
        this.GameId = dto.id;
        this.Name = dto.name;
        this.HostId = dto.hostId;
        this.Gamers = new Map(dto.gamers);
        this.Size = dto.size;
        this.State = dto.state;
  
        this.message = this.State === GameState.WAITING ? 'Ждём начала игры...' : null;
  
        if (dto.gameMap) {
          this.gameMap = new GameMap({
            isFrontend: true,
            dto: dto.gameMap
          });
          this.currentUserId = dto.currentUserId;
          this.tmpCurrentUserId = dto.tmpCurrentUserId;
          this.tmpEvents = dto.tmpEvents;
          this.events = dto.events;
        }
      }

    joinUser(user: IUser, socket?: Socket) {
        if (this.State === GameState.WAITING) {
            this.Gamers.set(user.id, { ...user, isConnected: true, isDeath: false });
        } else if (this.Gamers.has(user.id)) {
            const gamer = this.Gamers.get(user.id);
            gamer.isConnected = true;
        } else {
            return false;
        }
        if (socket) {
            socket.join(this.GameId);
        }
        return true;
    }

    leaveUser(user: IUser, socket?: Socket) {
        if (this.State === GameState.WAITING) {
            this.Gamers.delete(user.id);
        } else if (this.Gamers.has(user.id)) {
            const gamer = this.Gamers.get(user.id);
            gamer.isConnected = false;
        } else {
            return false;
        }
        if (socket) {
            socket.leave(this.GameId);
        }
        return true;
    }

    getUser(id: string) {
        if (this.Gamers.has(id)) {
            return this.Gamers.get(id);
        } else {
            return null;
        }
    }

    // TODO: start
    start(dto: IGameInfoResponse) {
        this.gameMap = null;
        this.gameMap = new GameMap({
            isFrontend: true,
            dto: dto.gameMap,
        });
        this.Gamers = new Map(dto.gamers);
        this.currentUserId = this.HostId;
        this.State = dto.state;
        this.message = null;
        this.events = [];
    }
    startBackend() {
        this.gameMap = new GameMap({
            isFrontend: false,
            size: this.Size
        });
        this.currentUserId = this.hostId;
        this.State = GameState.STARTED;
        this.events = [];
        let index = 0;
        for (const gamer of this.Gamers.values()) {
            gamer.color = GAME_COLORS[index];
            index++;
        }
    }
    
    getActions(user: IUser) {
        if (this.tmpCurrentUserId && this.tmpCurrentUserId !== user.id) {
            return [];
        } else if (this.tmpCurrentUserId && this.tmpCurrentUserId === user.id) {
            return this.tmpEvents;
        } else if (this.currentUserId !== user.id) {
            return [];
        } else {
            const gamer = this.getUser(user.id);
            return this.gameMap.getActions(gamer);
        }
      }

    // TODO: event
    get gamers() { return Array.from(this.Gamers); }
    event(event: IGameEvent) {
        const result = this.gameMap.mapEvent(event);
        this.events.push(event);
        if (result.isNext) {
            this.tmpCurrentUserId = null;
            this.tmpEvents = null;
            let index = this.gamers.findIndex(g => g[0] === this.currentUserId);
            index++;
            this.currentUserId = index >= this.gamers.length ? this.gamers[0][0] : this.gamers[index][0];
        } else {
            this.tmpCurrentUserId = result.tmpId;
            this.tmpEvents = result.tmpEvents;
        }
        // TODO: Простовить IsDeath игроку если у него нет замков и воинов или он не может покинуть заваёвонный замок
    }

    // TODO: finish
    finish(dto: IGameInfoResponse) {
        this.State = dto.state;
    }
    finishBackend() {
        this.State = GameState.FINISHED;
    }

    // BACKERND
    toUsers(socket: Socket) {
        return socket.broadcast.to(this.GameId);
    }

    get id() { return this.GameId; }
    get name() { return this.Name; }
    get hostId() { return this.HostId; }
    get size() { return this.Size; }
    get state() { return this.State; }
    get response(): IGameInfoResponse { return {
        id: this.id,
        name: this.name,
        hostId: this.hostId,
        gamers: this.gamers,
        size: this.size,
        state: this.state,
        gameMap: this.gameMap ? this.gameMap.response : this.gameMap,
        currentUserId: this.currentUserId,
        tmpCurrentUserId: this.tmpCurrentUserId,
        tmpEvents: this.tmpEvents,
        events: this.events,
    }; }

}
