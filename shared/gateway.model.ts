import { IUser } from './game-info.dto';
import { IGameEvent } from './game-event.model';
import { ISize } from './game-map.model';

export interface IAuthRequest {
    user?: IUser;
}

export interface IGameRequest extends IAuthRequest {
    gameId: string;
}

export interface ICreateGameRequest extends IAuthRequest {
    name: string;
    size: ISize;
}

export interface IGameEventRequest extends IAuthRequest {
    gameId: string;
    event: IGameEvent;
}
export interface IAddPushSubscriberRequest extends IAuthRequest {
    pushSubscription : any;
}

export interface IPushRequest extends IAuthRequest {
    title: string;
    body: string;
    gameId: string;
}
