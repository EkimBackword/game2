import * as mongoose from 'mongoose';
import { IGameInfoResponse } from '../../game-info.dto';

export const GameInfoSchema = new mongoose.Schema<IGameInfoResponse>({
    id: String,
    name: String,
    hostId: String,
    size: { height: Number, width: Number },
    gamers: mongoose.Schema.Types.Mixed,
    state: String,

    currentUserId: String,
    gameMap: mongoose.Schema.Types.Mixed,
    tmpCurrentUserId: String,
    tmpEvents: mongoose.Schema.Types.Mixed,
    events: mongoose.Schema.Types.Mixed,
    lastUpdate: Date,
});

export interface IGameInfoModel extends mongoose.Document, IGameInfoResponse {

}
