import { IPosition } from './game-map.model';
import { IUnit } from './game-unit.model';

export interface IGameEvent {
    type: GameEventType;
    // tslint:disable-next-line: max-line-length
    data: IGameEventData | IGameEventChooseTileData | IGameEventMoveData | IGameEventCaptureData | IGameEventAttackCastleData | IGameEventAttackUserData | IGameEventDefenseData | IGameEventTakeUnitData;
}

export enum GameEventType {
    chooseTile = 'chooseTile', // Выбор места
    move = 'move', // передвинуться на пустую клетку
    capture = 'capture', // захватить пустой замок
    attackCastle = 'attackCastle', // напасть на замок
    attackUser = 'attackUser', // напасть на игрока
    defense = 'defense', // оборона от атаки игрока
    takeUnit = 'takeUnit', // усилить войско
    castleUnitsChange = 'castleUnitsChange', // Изменить защиту замка
}

export interface IGameEventData {
    userId: string;
    color: string;
    to?: IPosition;
}
export interface IGameEventChooseTileData extends IGameEventData {
    to: IPosition;
}
export interface IGameEventMoveData extends IGameEventData {
    to: IPosition;
}
export interface IGameEventCaptureData extends IGameEventData {
    to: IPosition;
    units: IUnit[];
    army: IUnit[];
}
export interface IGameEventAttackCastleData extends IGameEventData {
    from: IPosition;
    to: IPosition;
    units: IUnit[];
    army: IUnit[];
}
export interface IGameEventAttackUserData extends IGameEventData {
    from: IPosition;
    to: IPosition;
    units: IUnit[];
    army: IUnit[];
    attackedUserId: string;
}
export interface IGameEventDefenseData extends IGameEventData {
    units: IUnit[];
    army: IUnit[];
    attackUnits: IUnit[];
    attackUserId: string;
}
export interface IGameEventTakeUnitData extends IGameEventData {
    units: IUnit[];
}
export interface IGameEventCastleUnitsChangeData extends IGameEventData {
    to: IPosition;
    units: IUnit[];
    army: IUnit[];
}
