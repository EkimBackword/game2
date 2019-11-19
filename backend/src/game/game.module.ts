import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PushService } from './push.service';

import { WsMyGuard } from './ws-my.guard';
import { GameInfoSchema } from './models/game-info.schema';
import { PushSubsSchema } from './models/push-subs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'GameInfo', schema: GameInfoSchema }]),
    MongooseModule.forFeature([{ name: 'PushSubs', schema: PushSubsSchema }]),
  ],
  providers: [
    GameService,
    PushService,
    GameGateway,
    WsMyGuard,
  ],
})
export class GameModule {}
