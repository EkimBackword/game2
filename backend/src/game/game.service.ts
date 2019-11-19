import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameInfo, ISize, IGameInfoResponse, GameState } from './models';
import { Socket } from 'socket.io';
import { IGameInfoModel } from './models/game-info.schema';

@Injectable()
export class GameService {

    private games: Map<string, GameInfo> = new Map();

    constructor(@InjectModel('GameInfo') private readonly gameInfoModel: Model<IGameInfoModel>) {
        this.findAll();
    }

    findList(): Map<string, GameInfo> {
        return this.games;
    }

    findByID(id: string): GameInfo {
        return this.games.get(id);
    }

    async createGame(name: string, hostId: string, size: ISize, socket?: Socket) {
        const game = new GameInfo( {
            isFrontend: false,
            backendDTO: { name, hostId, size, socket },
        });
        await this.create(game.response);
        this.games.set(game.id, game);
        return game;
    }

    async save(dto: IGameInfoResponse) {
        await this.gameInfoModel.updateOne({id: dto.id}, dto).exec();
    }

    private async create(dto: IGameInfoResponse) {
        const created = new this.gameInfoModel(dto);
        return await created.save();
    }

    private async delete(dto: IGameInfoResponse) {
        const game = await this.gameInfoModel.findOne({id: dto.id}).exec();
        return await game.remove();
    }

    private async findAll() {
        const list = await this.gameInfoModel.find().exec();
        for (const gameInfo of list) {
            const game = new GameInfo({
                isFrontend: true,
                frontendDTO: gameInfo,
            });
            const diff = Number(new Date()) - Number(game.lastUpdate);
            if ( (diff) / (1000 * 60 * 60) > 1) {
                await this.delete(gameInfo);
            } else {
                this.games.set(game.id, game);
            }
        }
    }

}
