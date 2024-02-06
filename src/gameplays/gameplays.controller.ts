import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CreateGameplayDto } from './dto/create-gameplay.dto';
import { GameplaysService } from './gameplays.service';

@Controller('gameplays')
export class GameplaysController {
  constructor(private gameplaysService: GameplaysService) {}

  @Post()
  async create(
    @Headers() headers: Record<string, string>,
    @Body() createGameplayDto: CreateGameplayDto,
  ): Promise<any> {
    return this.gameplaysService.create({
      ...createGameplayDto,
      email: headers['game-email'],
      difficulty: headers['game-difficulty'],
    });
  }
}
