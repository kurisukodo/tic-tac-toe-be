import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameplaysModule } from './gameplays/gameplays.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.SET_ENV === 'prod'
        ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rcjjg8a.mongodb.net/tic-tac-toe?retryWrites=true&w=majority`
        : 'mongodb://localhost:27017/tic-tac-toe',
    ),
    GameplaysModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
