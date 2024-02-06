import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MoveDocument = HydratedDocument<Move>;

@Schema()
export class Move {
  @Prop()
  row: number;

  @Prop()
  col: number;
}

export const MoveSchema = SchemaFactory.createForClass(Move);
