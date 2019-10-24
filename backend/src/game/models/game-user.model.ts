import { IPosition } from './game-map.model';
import { IUnit } from './game-unit.model';

export interface IGameUser extends IPosition {
    userId: string;
    color: string;
    army: IUnit[];
}

export interface IGameUserInBattle extends IGameUser {
    units: IUnit[];
}
