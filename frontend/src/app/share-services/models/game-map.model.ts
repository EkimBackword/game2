import { randomizer, getNearPoints } from './functions';
import { IUnit } from './game-unit.model';
import {
    IGameEvent,
    GameEventType,
    IGameEventChooseTileData,
    IGameEventMoveData,
    IGameEventCaptureData,
    IGameEventAttackCastleData,
    IGameEventAttackUserData,
    IGameEventDefenseData,
    IGameEventTakeUnitData,
} from './game-event.model';
import { IGameUser, IGameUserInBattle } from './game-user.model';
import { IEventResponse } from './game-info.dto';

export interface IPosition {
    x: number;
    y: number;
}

export interface ISize {
    height: number;
    width: number;
}

export interface ITile extends IPosition {
    visibleFor: string[]; // список id пользователей, которые выдят тайл.
    isCastle: boolean;
    castleInfo?: ICastleInfo;
}

export interface ICastleInfo {
    color: string;
    userId: string;
    units: IUnit[];
}

export class GameMap {

    public tiles: ITile[][];
    public size: ISize;
    public gameUsers: Map<string, IGameUser>;
    public battle: Map<string, IGameUserInBattle>;

    constructor(dto: GameMap) {
      this.tiles = dto.tiles;
      this.size = dto.size;
      this.gameUsers = dto.gameUsers;
      this.battle = dto.battle;
    }

    public mapEvent(event: IGameEvent): IEventResponse {
        switch (event.type) {
            case GameEventType.chooseTile: {
                return this.chooseTile(event.data as IGameEventChooseTileData);
            }
            case GameEventType.move: {
                return this.move(event.data as IGameEventMoveData);
            }
            case GameEventType.capture: {
                return this.capture(event.data as IGameEventCaptureData);
            }
            case GameEventType.attackCastle: {
                return this.attackCastle(event.data as IGameEventAttackCastleData);
            }
            case GameEventType.attackUser: {
                return this.attackUser(event.data as IGameEventAttackUserData);
            }
            case GameEventType.defense: {
                return this.defense(event.data as IGameEventDefenseData);
            }
            case GameEventType.takeUnit: {
                return this.takeUnit(event.data as IGameEventTakeUnitData);
            }
        }
    }

    //#region private
    private chooseTile(data: IGameEventChooseTileData): IEventResponse {
        this.gameUsers.set(data.userId, {
            color: data.color,
            userId: data.userId,
            army: [],
            x: data.to.x,
            y: data.to.y,
        });
        return { isNext: true, tmpId: null };
    }

    private move(data: IGameEventMoveData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        user.x = data.to.x;
        user.y = data.to.y;
        return { isNext: true, tmpId: null };
    }

    private capture(data: IGameEventCaptureData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        this.tiles[data.to.x][data.to.y].castleInfo = {
            color: data.color,
            userId: data.userId,
            units: data.units,
        };
        user.x = data.to.x;
        user.y = data.to.y;
        return { isNext: true, tmpId: null };
    }

    private attackCastle(data: IGameEventAttackCastleData): IEventResponse {
        return { isNext: true, tmpId: null };
    }

    private attackUser(data: IGameEventAttackUserData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        this.battle = new Map();
        this.battle.set(user.userId, { ...user, units: data.units });
        return { isNext: false, tmpId: data.attackedUserId };
    }

    private defense(data: IGameEventDefenseData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        this.battle.set(user.userId, { ...user, units: data.units });
        // TODO: Произвести битву
        return { isNext: true, tmpId: null };
    }

    private takeUnit(data: IGameEventTakeUnitData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        user.army.push(...data.units);
        return { isNext: true, tmpId: null };
    }
    //#endregion private
}
