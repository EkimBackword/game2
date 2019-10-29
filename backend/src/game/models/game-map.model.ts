import { randomizer, getNearPoints } from './functions';
import { IUnit, GameUnitType, genGameUnit } from './game-unit.model';
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
    hasUser?: boolean;
}

export interface ICastleInfo {
    color: string;
    userId: string;
    units: IUnit[];
}

export interface IEffect {
    unitTypeBonus: GameUnitType;
    deathCount: number;
    maxArmy: number;
}

export class GameMap {

    public tiles: ITile[][];
    public size: ISize;
    public gameUsers: Map<string, IGameUser>;
    public battle: Map<string, IGameUserInBattle>;
    public effect: IEffect;

    get response() {
        return Object.assign({}, this, {
            gameUsers: Array.from(this.gameUsers),
            battle: this.battle ? Array.from(this.battle) : this.battle,
        });
    }

    constructor(size: ISize) {
        this.size = size;
        this.gameUsers = new Map();
        this.effect = {
            deathCount: 0,
            maxArmy: 6,
            unitTypeBonus: null,
        };

        // gen map
        const positions: IPosition[] = [];
        this.tiles = [];
        for (let x = 0; x < size.width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < size.height; y++) {
                positions.push({x, y});
                this.tiles[x][y] = this.createTile(x, y);
            }
        }

        // gen castle
        const CastlesPoints = this.genCastlesPoints(positions);
        for (const point of CastlesPoints) {
            this.createCastle(point.x, point.y);
        }
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
    private createTile(x: number, y: number) {
        const tile: ITile = {
            x, y,
            visibleFor: [],
            isCastle: false,
        };
        return tile;
    }

    private genCastlesPoints(positions: IPosition[]) {
        const count = this.size.width === 6 ? 4 : 7;
        const result: IPosition[] = [];
        for (let i = 0; i < count; i++) {
            const point = positions[randomizer(0, positions.length - 1)];
            const nearPoints = getNearPoints(point);
            positions = positions.filter(p => {
                if (p.x === point.x && p.y === point.y) { return false; }
                return !nearPoints.some(near =>  p.x === near.x && p.y === near.y );
            });
            result.push(point);
        }
        return result;
    }

    private createCastle(x: number, y: number) {
        const castle: ICastleInfo = {
            color: null,
            userId: null,
            units: [],
        };
        this.tiles[x][y].isCastle = true;
        this.tiles[x][y].castleInfo = castle;
    }

    private setVisibleFor(to: IPosition, userId: string) {
        this.tiles[to.x][to.y].visibleFor.push(userId);
        getNearPoints(to).forEach(point => {
            if (this.tiles[point.x] && this.tiles[point.x][point.y] && this.tiles[point.x][point.y].visibleFor) {
                if (this.tiles[point.x][point.y].visibleFor.indexOf(userId) === -1) {
                    this.tiles[point.x][point.y].visibleFor.push(userId);
                }
            }
        });
    }

    // EVENTS

    private chooseTile(data: IGameEventChooseTileData): IEventResponse {
        this.gameUsers.set(data.userId, {
            color: data.color,
            userId: data.userId,
            army: [genGameUnit(), genGameUnit()],
            x: data.to.x,
            y: data.to.y,
        });
        this.tiles[data.to.x][data.to.y].hasUser = true;
        this.setVisibleFor(data.to, data.userId);
        return { isNext: true, tmpId: null };
    }

    private move(data: IGameEventMoveData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        this.tiles[user.x][user.y].hasUser = false;
        user.x = data.to.x;
        user.y = data.to.y;
        this.tiles[data.to.x][data.to.y].hasUser = true;
        this.setVisibleFor(data.to, data.userId);
        return { isNext: true, tmpId: null };
    }

    private capture(data: IGameEventCaptureData): IEventResponse {
        const user = this.gameUsers.get(data.userId);
        this.tiles[data.to.x][data.to.y].castleInfo = {
            color: data.color,
            userId: data.userId,
            units: data.units,
        };
        this.tiles[user.x][user.y].hasUser = false;
        user.x = data.to.x;
        user.y = data.to.y;
        this.tiles[data.to.x][data.to.y].hasUser = true;
        this.setVisibleFor(data.to, data.userId);
        return { isNext: true, tmpId: null };
    }

    private attackCastle(data: IGameEventAttackCastleData): IEventResponse {
        // TODO: Произвести битву
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
