import { IPosition } from './game-map.model';

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
