import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StatisticDocument = HydratedDocument<Statistic>;

@Schema()
export class Statistic {
  @Prop({ isRequired: true })
  email: string;

  @Prop({ default: 0 })
  won: number;

  @Prop({ default: 0 })
  lost: number;

  @Prop({ default: 0 })
  drawn: number;

  @Prop({ default: 0 })
  total: number;
}

export const StatisticSchema = SchemaFactory.createForClass(Statistic);
