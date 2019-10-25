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

export class GameInfo {

    public GameId: string;
    public Name: string;
    public HostId: string;
    public Gamers: Map<string, IGamer>;
    public State: GameState;
    public Size: ISize;

    public gameMap: GameMap;
    public currentUserId: string;
    public tmpCurrentUserId: string;
    public events: IGameEvent[];

    public message: string;

    constructor(dto: IGameInfoResponse) {
      this.GameId = dto.id;
      this.Name = dto.name;
      this.HostId = dto.hostId;
      this.Gamers = new Map(dto.gamers);
      this.Size = dto.size;
      this.State = dto.state;

      this.message = this.State === GameState.WAITING ? 'Ждём начала игры...' : null;

      if (dto.gameMap) {
        this.gameMap = new GameMap(dto.gameMap);
        this.currentUserId = dto.currentUserId;
        this.tmpCurrentUserId = dto.tmpCurrentUserId;
        this.events = dto.events;
      }
    }

    joinUser(user: IUser) {
      if (this.State === GameState.WAITING) {
          this.Gamers.set(user.id, { ...user, isConnected: true });
      } else if (this.Gamers.has(user.id)) {
          const gamer = this.Gamers.get(user.id);
          gamer.isConnected = true;
      } else {
          return false;
      }
      return true;
    }

    leaveUser(user: IUser) {
      if (this.State === GameState.WAITING) {
          this.Gamers.delete(user.id);
      } else if (this.Gamers.has(user.id)) {
          const gamer = this.Gamers.get(user.id);
          gamer.isConnected = false;
      } else {
          return false;
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
      this.gameMap = new GameMap(dto.gameMap);
      this.Gamers = new Map(dto.gamers);
      this.currentUserId = this.HostId;
      this.State = dto.state;
      this.message = null;
    }

    // TODO: event
    event(event: IGameEvent) {
      this.gameMap.mapEvent(event);
    }

    // TODO: finish
    finish(dto: IGameInfoResponse) {
      this.State = dto.state;
    }

}
