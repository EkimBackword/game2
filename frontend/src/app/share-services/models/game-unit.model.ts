import { randomizer } from './functions';
import * as uuid4 from 'uuid4';

export interface IUnit {
  id: string;
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
    id: uuid4(),
    power: randomizer(1, 10),
    type: types[type],
  };
  return unit;
};
