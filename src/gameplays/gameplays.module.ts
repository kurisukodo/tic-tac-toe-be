import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { GameplaysController } from './gameplays.controller';
import { GameplaysService } from './gameplays.service';
import { Gameplay, GameplaySchema } from './schemas/gameplay.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gameplay.name, schema: GameplaySchema },
    ]),
    StatisticsModule,
  ],
  controllers: [GameplaysController],
  providers: [GameplaysService],
})
export class GameplaysModule {}
