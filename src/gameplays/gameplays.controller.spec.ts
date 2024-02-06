import { Test, TestingModule } from '@nestjs/testing';
import { GameplaysController } from './gameplays.controller';

describe('GameplaysController', () => {
  let controller: GameplaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameplaysController],
    }).compile();

    controller = module.get<GameplaysController>(GameplaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
