import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { RequestStatisticDto } from './dto/request-statistic.dto';
import { Statistic } from './schemas/statistic.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic.name) private statisticModel: Model<Statistic>,
  ) {}

  private getTotal({ won, lost, drawn }: CreateStatisticDto) {
    return won + lost + drawn;
  }

  findOne(requestStatisticDto: RequestStatisticDto) {
    return this.statisticModel
      .findOne(
        { email: requestStatisticDto.email },
        {
          _id: 0,
          __v: 0,
          email: 0,
        },
      )
      .exec();
  }

  async findOneAndUpdate(createStatisticDto: CreateStatisticDto) {
    const exists = await this.findOne({ email: createStatisticDto.email });

    if (exists) {
      createStatisticDto = {
        ...createStatisticDto,
        won: createStatisticDto.won + exists.won,
        lost: createStatisticDto.lost + exists.lost,
        drawn: createStatisticDto.drawn + exists.drawn,
      };
    }

    const result = await this.statisticModel
      .findOneAndUpdate(
        { email: createStatisticDto.email },
        { ...createStatisticDto, total: this.getTotal(createStatisticDto) },
        {
          upsert: true,
          projection: {
            _id: 0,
            __v: 0,
          },
          new: true,
        },
      )
      .exec();

    return result;
  }
}
