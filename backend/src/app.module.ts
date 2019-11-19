import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { GameModule } from './game/game.module';
import { mongodbConfig } from './game/models';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    GameModule,
    MongooseModule.forRoot(mongodbConfig.url),
    AuthModule,
  ],
  controllers: [
    AppController,
  ],
})
export class AppModule {}
