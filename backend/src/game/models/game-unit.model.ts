import { randomizer } from "./functions";

export interface IUnit {
    type: GameUnitType;
    power: number;
}

export enum GameUnitType {
    Archer = 'Archer',
    Swordsman = 'Swordsman',
    Rider = 'Rider',
}

export const genGameUnit = () => {
    const types = [ GameUnitType.Archer, GameUnitType.Swordsman, GameUnitType.Rider ];
    const type = randomizer(0, 2);
    const unit: IUnit = {
        power: randomizer(1, 10),
        type: types[type],
    };
    return unit;
};
