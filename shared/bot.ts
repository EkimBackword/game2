import { IUser } from './game-info.dto';
import {
    IGameEvent,
    GameEventType,
    IGameEventCaptureData,
    IGameEventAttackCastleData,
    IGameEventAttackUserData,
    IGameEventCastleUnitsChangeData,
    IGameEventDefenseData
} from './game-event.model';
import { randomizer } from './functions';
import { ITile } from './game-map.model';

export class Bot {

    get toUser(): IUser {
        return {
            id: this.id,
            name: this.name
        };
    }

    private GameEventTypeIndex = {
        0: GameEventType.chooseTile,
        1: GameEventType.defense,
        2: GameEventType.capture,
        3: GameEventType.takeUnit,
        4: GameEventType.castleUnitsChange,
        5: GameEventType.attackCastle,
        6: GameEventType.attackUser,
        7: GameEventType.move,
    };

    constructor(private id: string, private name: string) { }

    selectEvent(activeEvents: IGameEvent[], tiles: ITile[][]) {
        for (const key in this.GameEventTypeIndex) {
            if (this.GameEventTypeIndex.hasOwnProperty(key)) {
                const type: GameEventType = this.GameEventTypeIndex[key];
                const events = activeEvents.filter(e => {
                    if (e.type !== type) {
                        return false;
                    }
                    switch (e.type) {
                        case GameEventType.capture: {
                            const data = e.data as IGameEventCaptureData;
                            return data.army.length >= 0;
                        }
                        case GameEventType.attackCastle: {
                            const data = e.data as IGameEventAttackCastleData;
                            const tile: ITile = tiles[data.to.x][data.to.y];
                            return data.army.length >= tile.castleInfo.units.length;
                        }
                        case GameEventType.attackUser: {
                            const data = e.data as IGameEventAttackUserData;
                            return data.army.length > 0;
                        }
                        case GameEventType.defense: {
                            return true;
                        }
                        case GameEventType.castleUnitsChange: {
                            const data = e.data as IGameEventCastleUnitsChangeData;
                            const tile: ITile = tiles[data.to.x][data.to.y];
                            return tile.castleInfo.units.length < 6 && data.army.length > 0;
                        }
                        default: {
                            return true;
                        }
                    }
                });
                if (events.length > 0) {
                    return events[randomizer(0, events.length - 1)];
                }
            }
        }
        return activeEvents[randomizer(0, activeEvents.length - 1)];
    }

    changeEventData(event: IGameEvent, tile?: ITile) {
        switch (event.type) {
            case GameEventType.capture: {
                const data = event.data as IGameEventCaptureData;
                if (data.army.length > 0) {
                    data.units.push(data.army.pop());
                }
                event.data = data;
                return event;
            }
            case GameEventType.attackCastle: {
                const data = event.data as IGameEventAttackCastleData;
                data.army  = data.army.sort((a, b) => a.power > b.power ? -1 : a.power < b.power ? 1 : 0);
                while (data.army.length > 0 && data.units.length < 6) {
                    data.units.push(data.army.pop());
                }
                event.data = data;
                return event;
            }
            case GameEventType.attackUser: {
                const data = event.data as IGameEventAttackUserData;
                data.army  = data.army.sort((a, b) => a.power > b.power ? -1 : a.power < b.power ? 1 : 0);
                while (data.army.length > 0 && data.units.length < 6) {
                    data.units.push(data.army.pop());
                }
                event.data = data;
                return event;
            }
            case GameEventType.defense: {
                const data = event.data as IGameEventDefenseData;
                data.army  = data.army.sort((a, b) => a.power > b.power ? -1 : a.power < b.power ? 1 : 0);
                while (data.army.length > 0 && data.units.length < 6) {
                    data.units.push(data.army.pop());
                }
                event.data = data;
                return event;
            }
            case GameEventType.castleUnitsChange: {
                const data = event.data as IGameEventCastleUnitsChangeData;
                data.army  = data.army.sort((a, b) => a.power > b.power ? -1 : a.power < b.power ? 1 : 0);
                while (data.army.length > 0 && data.units.length < 6) {
                    data.units.push(data.army.pop());
                }
                event.data = data;
                return event;
            }
            default: {
                return event;
            }
        }
    }
}