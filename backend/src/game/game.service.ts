import { Injectable } from '@nestjs/common';
import { GameInfo, ISize } from './models';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {

    private games: Map<string, GameInfo> = new Map();

    findList(): Map<string, GameInfo> {
        return this.games;
    }

    findByID(id: string): GameInfo {
        return this.games.get(id);
    }

    createGame(name: string, hostId: string, size: ISize, socket?: Socket) {
        const game = new GameInfo( {
            isFrontend: false,
            backendDTO: { name, hostId, size, socket },
        });
        this.games.set(game.id, game);
        return game;
    }

}
