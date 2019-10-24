import { Module } from '@nestjs/common';

import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

import { WsMyGuard } from './ws-my.guard';

@Module({
  imports: [ ],
  providers: [
    GameService,
    GameGateway,
    WsMyGuard,
  ],
})
export class GameModule {}
