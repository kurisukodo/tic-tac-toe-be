import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Move } from './move.schema';

export type GameplayDocument = HydratedDocument<Gameplay>;

@Schema()
export class Gameplay {
  @Prop()
  email: string;

  @Prop({ default: 'easy' })
  difficulty: string;

  @Prop({ default: 'idle' })
  status: string;

  @Prop()
  moves: Move[];
}

export const GameplaySchema = SchemaFactory.createForClass(Gameplay);
