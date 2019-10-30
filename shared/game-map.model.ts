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
import { IEventResponse, IUser, IGamer } from './game-info.dto';

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
    userId?: string;
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

export interface IGameMapOption {
    isFrontend: boolean;
    size?: ISize;
    dto?: GameMap;
}

export interface IBattleResult {
  isWin: boolean;
  attackPower: number;
  defensePower: number;
}

export class GameMap {

  public tiles: ITile[][];
  public size: ISize;
  public gameUsers: Map<string, IGameUser>;
  public battle: Map<string, IGameUserInBattle>;
  public effect: IEffect;

  constructor(option: IGameMapOption) {
      if (option.isFrontend) {
          this.initFrontend(option.dto);
      } else {
          this.initBackend(option.size);
      }
  }

  initBackend(size: ISize) {
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

  initFrontend(dto: GameMap) {
      this.tiles = dto.tiles;
      this.size = dto.size;
      this.gameUsers = dto.gameUsers instanceof Map ? dto.gameUsers : new Map(dto.gameUsers);
      this.battle = dto.battle instanceof Map ? dto.battle : new Map(dto.battle);
      this.effect = dto.effect;
  }

  public getActions(user: IGamer) {
    const gamer = this.gameUsers.get(user.id);
    if (gamer) {
      return this.getGamerActions(gamer);
    } else {
      return this.getStartActions(user);
    }
  }

  private getGamerActions(gamer: IGameUser) {
    const events: IGameEvent[] = getNearPoints({ x: gamer.x, y: gamer.y }).filter(point => {
      return !!this.tiles[point.x] && !!this.tiles[point.x][point.y];
    }).map(point => {
      const tile = this.tiles[point.x][point.y];
      let event: IGameEvent = {
        type: null,
        data: null,
      };
      if (!tile.isCastle) {
        if (tile.hasUser) {
          return this.getActionAttackUser(gamer, tile, event);
        }
        else {
          return this.getActionMove(gamer, tile, event);
        }
      }
      else if (tile.castleInfo.userId === null) {
        return this.getActionCaptureCastle(gamer, tile, event);
      }
      else if (tile.castleInfo.userId === gamer.userId) {
        return this.getActionMove(gamer, tile, event);
      }
      else {
        return this.getActionAttackCastle(gamer, tile, event);
      }
    });
    const userTile = this.tiles[gamer.x][gamer.y];
    if (userTile.isCastle && gamer.army.length < this.effect.maxArmy) {
      const event = this.getActionTakeUnit(gamer);
      events.push(event);
    }
    return events;
  }

  private getStartActions(user: IGamer) {
    const events: IGameEvent[] = [];
    for (const row of this.tiles) {
      for (const tile of row) {
        if (!tile.hasUser) {
          events.push({
            type: GameEventType.chooseTile,
            data: {
              userId: user.id,
              color: user.color,
              to: { x: tile.x, y: tile.y }
            } as IGameEventChooseTileData
          });
        }
      }
    }
    return events;
  }

  private getActionTakeUnit(gamer: IGameUser) {
    const data: IGameEventTakeUnitData = {
      color: gamer.color,
      userId: gamer.userId,
      units: [genGameUnit()]
    };
    const event = { type: GameEventType.takeUnit, data };
    return event;
  }

  private getActionAttackCastle(gamer: IGameUser, tile: ITile, event: IGameEvent) {
    const data: IGameEventAttackCastleData = {
      color: gamer.color,
      userId: gamer.userId,
      from: { x: gamer.x, y: gamer.y },
      to: { x: tile.x, y: tile.y },
      units: [],
      army: gamer.army,
    };
    event = { type: GameEventType.attackCastle, data };
    return event;
  }

  private getActionCaptureCastle(gamer: IGameUser, tile: ITile, event: IGameEvent) {
    const data: IGameEventCaptureData = {
      color: gamer.color,
      userId: gamer.userId,
      to: { x: tile.x, y: tile.y },
      units: [],
      army: gamer.army,
    };
    event = { type: GameEventType.capture, data };
    return event;
  }

  private getActionMove(gamer: IGameUser, tile: ITile, event: IGameEvent) {
    const data: IGameEventMoveData = {
      color: gamer.color,
      userId: gamer.userId,
      to: { x: tile.x, y: tile.y }
    };
    event = { type: GameEventType.move, data };
    return event;
  }

  private getActionAttackUser(gamer: IGameUser, tile: ITile, event: IGameEvent) {
    const data: IGameEventAttackUserData = {
      color: gamer.color,
      userId: gamer.userId,
      army: gamer.army,
      units: [],
      from: { x: gamer.x, y: gamer.y },
      to: { x: tile.x, y: tile.y },
      attackedUserId: tile.userId,
    };
    event = { type: GameEventType.attackUser, data };
    return event;
  }

  private getAttckedAction(gamer: IGameUser, attackId: string) {
    const data: IGameEventDefenseData = {
      userId: gamer.userId,
      color: gamer.color,
      units: [],
      army: gamer.army,
      attackUnits: this.battle.get(attackId).units
    };
    const event: IGameEvent = {
      type: GameEventType.defense,
      data
    };
    return [event];
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



  // EVENTS

  private chooseTile(data: IGameEventChooseTileData): IEventResponse {
      this.gameUsers.set(data.userId, {
          color: data.color,
          userId: data.userId,
          army: [genGameUnit(), genGameUnit()],
          x: data.to.x,
          y: data.to.y,
          castleCount: 0
      });
      this.tiles[data.to.x][data.to.y].hasUser = true;
      this.setVisibleFor(data.to, data.userId);
      return { isNext: true, tmpId: null };
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

  private move(data: IGameEventMoveData): IEventResponse {
      const user = this.gameUsers.get(data.userId);
      this.moveUserTo(user, data.to);
      this.setVisibleFor(data.to, data.userId);
      return { isNext: true, tmpId: null };
  }

  private moveUserTo(user: IGameUser, to: IPosition) {
    this.tiles[user.x][user.y].hasUser = false;
    user.x = to.x;
    user.y = to.y;
    this.tiles[to.x][to.y].hasUser = true;
  }

  private capture(data: IGameEventCaptureData): IEventResponse {
      const user = this.gameUsers.get(data.userId);
      user.army = data.army;
      this.tiles[data.to.x][data.to.y].castleInfo = {
        color: data.color,
        userId: data.userId,
        units: data.units,
      };
      this.moveUserTo(user, data.to);
      this.setVisibleFor(data.to, data.userId);
      user.castleCount++;
      return { isNext: true, tmpId: null };
  }

  private attackCastle(data: IGameEventAttackCastleData): IEventResponse {
    const user = this.gameUsers.get(data.userId);
    user.army = data.army;
    const tile = this.tiles[data.to.x][data.to.y];
    const result = this.getBattleResult(data.units, tile.castleInfo.units);
    if (result.isWin) {
      const eventResult: IEventResponse = {
        isNext: true,
        tmpId: null
      }
      if (tile.hasUser) {
        eventResult.tmpId = tile.castleInfo.userId;
        const defenseUser = this.gameUsers.get(tile.castleInfo.userId);
        defenseUser.castleCount--;
        eventResult.tmpEvents = this.getGamerActions(defenseUser).filter(e => e.type === GameEventType.move);
      }
      this.tiles[data.to.x][data.to.y].castleInfo = {
        color: data.color,
        userId: data.userId,
        units: data.units,
      };
      user.castleCount++;
      this.moveUserTo(user, data.to);
      this.setVisibleFor(data.to, data.userId);
      return eventResult;
    }
    return { isNext: true, tmpId: null };
  }

  private getBattleResult(attackUnits: IUnit[], defenseUnits: IUnit[]): IBattleResult {
    const attackPower = attackUnits.reduce((prev, unit) => prev + unit.power, 0);
    const defensePower = defenseUnits.reduce((prev, unit) => prev + unit.power, 0);
    return { attackPower, defensePower,
      isWin: attackPower > defensePower
    }
  }

  private attackUser(data: IGameEventAttackUserData): IEventResponse {
      const user = this.gameUsers.get(data.userId);
      user.army = data.army;
      this.battle = new Map();
      this.battle.set(user.userId, { ...user, units: data.units });
      return { isNext: false, tmpId: data.attackedUserId };
  }

  private defense(data: IGameEventDefenseData): IEventResponse {
      const user = this.gameUsers.get(data.userId);
      user.army = data.army;
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

  get response() {
      return Object.assign({}, this, {
          gameUsers: Array.from(this.gameUsers),
          battle: this.battle ? Array.from(this.battle) : this.battle,
      });
  }
}
