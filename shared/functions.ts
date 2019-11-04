import { IPosition, ISize } from './game-map.model';

enum GameUnitType {
    Archer = 'Archer',
    Swordsman = 'Swordsman',
    Rider = 'Rider',
}

export interface IPeriodEffects {
    title: string;
    description: string;
    unitTypeBonus: GameUnitType;
    maxArmyUp: number;
    deathCount: number;
}

export const randomizer = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getNearPoints = (point: IPosition): IPosition[] => {
    return [
        { x: point.x - 1, y: point.y},
        { x: point.x + 1, y: point.y},
        { x: point.x, y: point.y - 1},
        { x: point.x, y: point.y + 1},
        { x: point.x - 1, y: point.y - 1},
        { x: point.x + 1, y: point.y - 1},
        { x: point.x - 1, y: point.y + 1},
        { x: point.x + 1, y: point.y + 1},
    ];
};

export const genPeriodEffects = (size: ISize): IPeriodEffects[] => {
    const PeriodOfArcher: IPeriodEffects = {
        title: 'Эпоха лучников',
        description: 'Каждый лучник получает +1 к боевой мощи',
        unitTypeBonus: GameUnitType.Archer,
        maxArmyUp: 0,
        deathCount: 0
    };
    const PeriodOfSwordsman: IPeriodEffects = {
        title: 'Эпоха мечников',
        description: 'Каждый мечник получает +1 к боевой мощи',
        unitTypeBonus: GameUnitType.Swordsman,
        maxArmyUp: 0,
        deathCount: 0
    };
    const PeriodOfRider: IPeriodEffects = {
        title: 'Эпоха всадник',
        description: 'Каждый всадник получает +1 к боевой мощи',
        unitTypeBonus: GameUnitType.Rider,
        maxArmyUp: 0,
        deathCount: 0
    };
    const PeriodOfDark: IPeriodEffects = {
        title: 'Темная эпоха',
        description: 'Боевых бонусов нет.',
        unitTypeBonus: null,
        maxArmyUp: 0,
        deathCount: 1
    };
    const NewAge: IPeriodEffects = {
        title: 'Новый век',
        description: 'Максимальный размер войска увеличивается на 2 юнита.',
        unitTypeBonus: null,
        maxArmyUp: 2,
        deathCount: 0
    };
    const ArmyUp: IPeriodEffects = {
        title: 'Боевое усиление',
        description: 'Каждый игрок получает нового боевого юнита.',
        unitTypeBonus: null,
        maxArmyUp: 0,
        deathCount: 0
    };
    const ArmyDown: IPeriodEffects = {
        title: 'Засуха',
        description: 'Каждый игрок теряет самого слабого боевого юнита из войска.',
        unitTypeBonus: null,
        maxArmyUp: 0,
        deathCount: 0
    };
    const Empty: IPeriodEffects = {
        title: 'Пустая карта',
        description: 'Боевых бонусов нет.',
        unitTypeBonus: null,
        maxArmyUp: 0,
        deathCount: 0
    };

    let list: IPeriodEffects[] = [];
    if (size.width === 6 && size.height === 6) {
        list = list.concat(
            [PeriodOfArcher, PeriodOfArcher],
            [PeriodOfSwordsman, PeriodOfSwordsman],
            [PeriodOfRider, PeriodOfRider],
            [PeriodOfDark, PeriodOfDark, PeriodOfDark ],
            [NewAge, NewAge],
            [ArmyUp, ArmyUp],
            [ArmyDown, ArmyDown],
            [Empty, Empty],
        );
    } else {
        list = list.concat(
            [PeriodOfArcher, PeriodOfArcher],
            [PeriodOfSwordsman, PeriodOfSwordsman],
            [PeriodOfRider, PeriodOfRider],
            [PeriodOfDark, PeriodOfDark, PeriodOfDark ],
            [NewAge, NewAge, NewAge],
            [ArmyUp, ArmyUp, ArmyUp],
            [ArmyDown, ArmyDown, ArmyDown],
            [Empty, Empty, Empty, Empty],
        );
    }
    return list.sort(() => randomizer(-1, 1));
};
