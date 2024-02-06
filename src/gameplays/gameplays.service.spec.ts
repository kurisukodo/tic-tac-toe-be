import { Test, TestingModule } from '@nestjs/testing';
import { GameplaysService } from './gameplays.service';

describe('GameplaysService', () => {
  let service: GameplaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameplaysService],
    }).compile();

    service = module.get<GameplaysService>(GameplaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
