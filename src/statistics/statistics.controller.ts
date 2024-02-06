import { Controller, Get, Headers, Post } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  async findOne(@Headers() headers: Record<string, string>): Promise<any> {
    return this.statisticsService.findOne({
      email: headers['game-email'],
    });
  }
}
