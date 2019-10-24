import { Injectable } from '@nestjs/common';
import { GameInfo } from './models/game-info.dto';
import { Socket } from 'socket.io';
import { ISize } from './models/game-map.model';

@Injectable()
export class GameService {

    private games: Map<string, GameInfo>;

    findList(): Map<string, GameInfo> {
        return this.games;
    }

    findByID(id: string): GameInfo {
        return this.games.get(id);
    }

    // TODO: createGame
    createGame(name: string, hostId: string, size: ISize, socket?: Socket) {
        const game = new GameInfo(name, hostId, size, socket);
        this.games.set(game.id, game);
        return game;
    }

    // TODO: startGame
    startGame(id: string, socket: Socket) {
        const game = this.findByID(id);
        game.start(socket);
        return game;
    }

    // TODO: finishGame
    finishGame(id: string, socket: Socket) {
        const game = this.findByID(id);
        game.finish(socket);
        return game;
    }

}
