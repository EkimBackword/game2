import { randomizer, getNearPoints, genPeriodEffects, IPeriodEffects } from './functions';
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
    maxDeathCount: number;
    maxArmy: number;
    nextEffect: number;
    emptyCastle: number;
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
  survivorsUnits: IUnit[];
}

export class GameMap {

  public tiles: ITile[][];
  public size: ISize;
  public gameUsers: Map<string, IGameUser>;
  public effect: IEffect;
  public deckPeriodEffects: IPeriodEffects[];
  public deckOldEffects: IPeriodEffects[];
  public currentPeriodEffects: IPeriodEffects;


  constructor(option: IGameMapOption) {
    if (option.isFrontend) {
      this.initFrontend(option.dto);
    } else {
      this.initBackend(option.size);
    }
  }

  //#region init
  initBackend(size: ISize): void {
      this.size = size;
      this.gameUsers = new Map();
      this.deckPeriodEffects = genPeriodEffects(size);
      this.deckOldEffects = [];
      this.currentPeriodEffects = null;
      this.effect = {
          deathCount: 0,
          maxDeathCount: this.getMaxDeathCount(),
          maxArmy: 6,
          unitTypeBonus: null,
          nextEffect: 4,
          emptyCastle: this.getMaxCastle()
      };

      // gen map
      const positions: IPosition[] = [];
      this.tiles = [];
      for (let x: number = 0; x < size.width; x++) {
          this.tiles[x] = [];
          for (let y: number = 0; y < size.height; y++) {
              positions.push({x, y});
              this.tiles[x][y] = this.createTile(x, y);
          }
      }

      // gen castle
      const CastlesPoints: IPosition[] = this.genCastlesPoints(positions);
      for (const point of CastlesPoints) {
          this.createCastle(point.x, point.y);
      }
  }

  private getMaxCastle(): number {
    return this.size.width === 6 ? 5 : 8;
  }

  private getMaxDeathCount(): number {
    return this.size.width === 6 ? 3 : 3;
  }

  initFrontend(dto: GameMap): void {
      this.tiles = dto.tiles;
      this.size = dto.size;
      this.gameUsers = dto.gameUsers instanceof Map ? dto.gameUsers : new Map(dto.gameUsers);
      this.effect = dto.effect;
      this.deckPeriodEffects = dto.deckPeriodEffects;
      this.deckOldEffects = dto.deckOldEffects;
      this.currentPeriodEffects = dto.currentPeriodEffects;
  }
  //#endregion init

  //#region getAction
  public getActions(user: IGamer): IGameEvent[] {
    const gamer: IGameUser = this.gameUsers.get(user.id);
    if (gamer) {
      return this.getGamerActions(gamer);
    } else {
      return this.getStartActions(user);
    }
  }

  private getGamerActions(gamer: IGameUser): IGameEvent[] {
    const events: IGameEvent[] = getNearPoints({ x: gamer.x, y: gamer.y }).filter(point => {
      return !!this.tiles[point.x] && !!this.tiles[point.x][point.y];
    }).map(point => {
      const tile: ITile = this.tiles[point.x][point.y];
      if (!tile.isCastle) {
        if (tile.hasUser) {
          return this.getActionAttackUser(gamer, tile);
        } else {
          return this.getActionMove(gamer, tile);
        }
      } else if (tile.castleInfo.userId === null) {
        return this.getActionCaptureCastle(gamer, tile);
      } else if (tile.castleInfo.userId === gamer.userId) {
        return this.getActionMove(gamer, tile);
      } else {
        return this.getActionAttackCastle(gamer, tile);
      }
    });
    const userTile: ITile = this.tiles[gamer.x][gamer.y];
    if (userTile.isCastle && gamer.army.length < this.effect.maxArmy) {
      const event: IGameEvent = this.getActionTakeUnit(gamer);
      events.push(event);
    }
    return events;
  }

  private getStartActions(user: IGamer): IGameEvent[] {
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

  private getActionTakeUnit(gamer: IGameUser): IGameEvent {
    const data: IGameEventTakeUnitData = {
      color: gamer.color,
      userId: gamer.userId,
      units: [genGameUnit()]
    };
    return { type: GameEventType.takeUnit, data };
  }

  private getActionAttackCastle(gamer: IGameUser, tile: ITile): IGameEvent {
    const data: IGameEventAttackCastleData = {
      color: gamer.color,
      userId: gamer.userId,
      from: { x: gamer.x, y: gamer.y },
      to: { x: tile.x, y: tile.y },
      units: [],
      army: gamer.army,
    };
    return { type: GameEventType.attackCastle, data };
  }

  private getActionCaptureCastle(gamer: IGameUser, tile: ITile): IGameEvent {
    const data: IGameEventCaptureData = {
      color: gamer.color,
      userId: gamer.userId,
      to: { x: tile.x, y: tile.y },
      units: [],
      army: gamer.army,
    };
    return { type: GameEventType.capture, data };
  }

  private getActionMove(gamer: IGameUser, tile: ITile): IGameEvent {
    const data: IGameEventMoveData = {
      color: gamer.color,
      userId: gamer.userId,
      to: { x: tile.x, y: tile.y }
    };
    return { type: GameEventType.move, data };
  }

  private getActionAttackUser(gamer: IGameUser, tile: ITile): IGameEvent {
    const data: IGameEventAttackUserData = {
      color: gamer.color,
      userId: gamer.userId,
      army: gamer.army,
      units: [],
      from: { x: gamer.x, y: gamer.y },
      to: { x: tile.x, y: tile.y },
      attackedUserId: tile.userId,
    };
    return { type: GameEventType.attackUser, data };
  }

  private getActionDefense(defenseGamer: IGameUser, attackGamer: IGameUser, attackUnits: IUnit[]): IGameEvent {
    const data: IGameEventDefenseData = {
      userId: defenseGamer.userId,
      color: defenseGamer.color,
      units: [],
      army: defenseGamer.army,
      to: { x: defenseGamer.x, y: defenseGamer.y },
      attackUnits,
      attackUserId: attackGamer.userId
    };
    const event: IGameEvent = {
      type: GameEventType.defense,
      data
    };
    return event;
  }
  //#endregion getAction

  //#region protected
  protected createTile(x: number, y: number): ITile {
    const tile: ITile = {
      x, y,
      visibleFor: [],
      isCastle: false,
    };
    return tile;
  }

  protected genCastlesPoints(positions: IPosition[]): IPosition[] {
    const count: number = this.effect.emptyCastle;
    const result: IPosition[] = [];
    for (let i: number = 0; i < count; i++) {
      const point: IPosition = positions[randomizer(0, positions.length - 1)];
      positions = positions.filter(p => {
        if (p.x === point.x && p.y === point.y) { return false; }
        return true;
      });
      result.push(point);
    }
    return result;
  }

  protected createCastle(x: number, y: number): void {
    const castle: ICastleInfo = {
      color: null,
      userId: null,
      units: [],
    };
    this.tiles[x][y].isCastle = true;
    this.tiles[x][y].castleInfo = castle;
  }

  protected setVisibleFor(to: IPosition, userId: string): void {
    this.tiles[to.x][to.y].visibleFor.push(userId);
    getNearPoints(to).forEach(point => {
      if (this.tiles[point.x] && this.tiles[point.x][point.y] && this.tiles[point.x][point.y].visibleFor) {
        if (this.tiles[point.x][point.y].visibleFor.indexOf(userId) === -1) {
          this.tiles[point.x][point.y].visibleFor.push(userId);
        }
      }
    });
  }

  protected moveUserTo(user: IGameUser, to: IPosition): void {
    this.tiles[user.x][user.y].hasUser = false;
    this.tiles[user.x][user.y].userId = null;
    user.x = to.x;
    user.y = to.y;
    this.tiles[to.x][to.y].hasUser = true;
    this.tiles[to.x][to.y].userId = user.userId;
  }

  public checkDeathStatusOfUser(user: IGamer): boolean {
    if (this.gameUsers.has(user.id)) {
      const gamer: IGameUser = this.gameUsers.get(user.id);
      if (gamer.army.length === 0 && gamer.castleCount === 0 && this.effect.emptyCastle === 0) {
        return this.setDeathToUser(user);
      }
      return false;
    } else {
      return true;
    }
  }

  public setDeathToUser(user: IGamer): boolean {
    if (this.gameUsers.has(user.id)) {
      const gamer: IGameUser = this.gameUsers.get(user.id);
      this.tiles[gamer.x][gamer.y].hasUser = false;
      this.tiles[gamer.x][gamer.y].userId = null;
      this.gameUsers.delete(user.id);
    }
    return true;
  }

  public getBattleResult(attackUnits: IUnit[], defenseUnits: IUnit[]): IBattleResult {
    const attackPower: number = attackUnits.reduce((prev, unit) => {
      const bonus: number = unit.type === this.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
    const defensePower: number = defenseUnits.reduce((prev, unit) => {
      const bonus: number = unit.type === this.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
    const diffPower: number = Math.abs(attackPower - defensePower);
    const survivorsUnits: IUnit[] = attackPower > defensePower ?
      this.getSurvivorsUnits(attackUnits, diffPower) :
      this.getSurvivorsUnits(defenseUnits, diffPower);
    return { attackPower, defensePower, survivorsUnits,
      isWin: attackPower > defensePower
    };
  }

  public setNewPeriodEffects() {
    this.effect.nextEffect--;
    if (this.effect.nextEffect === 0) {
      this.effect.nextEffect = 4;
      this.currentPeriodEffects = null;
      const currentPeriodEffects = this.deckPeriodEffects.pop();
      setTimeout(() => {
        this.currentPeriodEffects = currentPeriodEffects;
        this.deckOldEffects.push(JSON.parse(JSON.stringify(currentPeriodEffects)));
      }, 0);
      this.effect.deathCount += currentPeriodEffects.deathCount;
      this.effect.maxArmy += currentPeriodEffects.maxArmyUp;
      this.effect.unitTypeBonus = currentPeriodEffects.unitTypeBonus;
      if (currentPeriodEffects.title === 'Боевое усиление') {
        for (const user of this.gameUsers.values()) {
          if (user.army.length < this.effect.maxArmy) {
            user.army.push(genGameUnit());
          }
        }
      } else if (currentPeriodEffects.title === 'Засуха') {
        for (const user of this.gameUsers.values()) {
          user.army.sort((a, b) => a.power > b.power ? 1 : a.power < b.power ? -1 : 0)
              .splice(0, 1);
        }
      }
    }
  }

  public checkCastles(): boolean {
    for (const gamer of this.gameUsers.values()) {
      if (gamer.castleCount === this.getMaxCastle()) {
        return true;
      }
    }
    return false;
  }

  protected getSurvivorsUnits(units: IUnit[], diffPower: number): IUnit[] {
    let survivorsPower: number = 0;
    return units.sort((a, b) => a.power > b.power ? 1 : a.power < b.power ? -1 : 0)
                .filter(unit => {
                  if (survivorsPower < diffPower) {
                    survivorsPower += unit.power;
                    return true;
                  }
                  return false;
                });
  }
  //#endregion protected

  //#region Events
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

  private chooseTile(data: IGameEventChooseTileData): IEventResponse {
    const user: IGameUser = {
      color: data.color,
      userId: data.userId,
      army: [genGameUnit(), genGameUnit()],
      x: data.to.x,
      y: data.to.y,
      castleCount: 0
    };
    this.gameUsers.set(data.userId, user);

    const tile: ITile = this.tiles[data.to.x][data.to.y];
    tile.hasUser = true;
    tile.userId = data.userId;
    this.setVisibleFor(data.to, data.userId);

    const response: IEventResponse = { isNext: true, tmpId: null };
    if(tile.isCastle) {
      response.isNext = false;
      response.tmpId = user.userId;
      response.tmpEvents = [
        this.getActionCaptureCastle(user, tile)
      ];
    }
    return response;
  }

  private move(data: IGameEventMoveData): IEventResponse {
    const user: IGameUser = this.gameUsers.get(data.userId);
    this.moveUserTo(user, data.to);
    this.setVisibleFor(data.to, data.userId);
    return { isNext: true, tmpId: null };
  }

  private capture(data: IGameEventCaptureData): IEventResponse {
    const user: IGameUser = this.gameUsers.get(data.userId);
    user.army = data.army;
    this.tiles[data.to.x][data.to.y].castleInfo = {
      color: data.color,
      userId: data.userId,
      units: data.units,
    };
    this.moveUserTo(user, data.to);
    this.setVisibleFor(data.to, data.userId);
    user.castleCount++;
    this.effect.emptyCastle--;
    return { isNext: true, tmpId: null };
  }

  private attackCastle(data: IGameEventAttackCastleData): IEventResponse {
    const user: IGameUser = this.gameUsers.get(data.userId);
    user.army = data.army;
    const tile: ITile = this.tiles[data.to.x][data.to.y];
    const result: IBattleResult = this.getBattleResult(data.units, tile.castleInfo.units);
    const eventResult: IEventResponse = { isNext: true, tmpId: null };
    if (result.isWin) {
      const defenseUser: IGameUser = this.gameUsers.get(tile.castleInfo.userId);
      defenseUser.castleCount--;
      if (tile.hasUser) {
        eventResult.isNext = false;
        eventResult.tmpId = defenseUser.userId;
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
    }
    return eventResult;
  }

  private attackUser(data: IGameEventAttackUserData): IEventResponse {
    const attackUser: IGameUser = this.gameUsers.get(data.userId);
    attackUser.army = data.army;
    const defenseUser: IGameUser = this.gameUsers.get(data.attackedUserId);
    return {
      isNext: false,
      tmpId: defenseUser.userId,
      tmpEvents: [this.getActionDefense(defenseUser, attackUser, data.units)]
    };
  }

  private defense(data: IGameEventDefenseData): IEventResponse {
    const defenseUser: IGameUser = this.gameUsers.get(data.userId);
    const attackUser: IGameUser = this.gameUsers.get(data.attackUserId);
    defenseUser.army = data.army;
    const BattleResult: IBattleResult = this.getBattleResult(data.attackUnits, data.units);
    if (BattleResult.isWin) {
      attackUser.army = attackUser.army.concat(BattleResult.survivorsUnits);
    } else {
      defenseUser.army = defenseUser.army.concat(BattleResult.survivorsUnits);
    }
    return { isNext: true, tmpId: null };
  }

  private takeUnit(data: IGameEventTakeUnitData): IEventResponse {
    const user: IGameUser = this.gameUsers.get(data.userId);
    user.army.push(...data.units);
    return { isNext: true, tmpId: null };
  }
  //#endregion Events

  get response() {
    return Object.assign({}, this, {
        gameUsers: Array.from(this.gameUsers),
    });
  }
}
