import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticsService } from 'src/statistics/statistics.service';
import { CreateGameplayDto } from './dto/create-gameplay.dto';
import { Gameplay } from './schemas/gameplay.schema';

type Boards = {
  [player: string]: Board;
};

type Board = string[][];

type Moves = {
  [player: string]: Move[];
};

type Move = {
  row: number;
  col: number;
};

@Injectable()
export class GameplaysService {
  @Inject(StatisticsService)
  private readonly statisticsService: StatisticsService;

  private boards: Boards = {};
  private moves: Moves = {};
  private difficulty: string;

  constructor(
    @InjectModel(Gameplay.name) private gameplayModel: Model<Gameplay>,
  ) {}

  private initializeBoard(player: string, size: number = 3) {
    this.boards[player] = Array.from({ length: size }, () =>
      Array(size).fill(''),
    );
    this.moves[player] = [];
  }

  private isBoardFull(player: string): boolean {
    return this.boards[player].every((row) => row.every((cell) => cell !== ''));
  }

  private isMoveValid(row: number, col: number, player: string): boolean {
    return this.boards[player][row][col] === '';
  }

  private isNotEmpty(value: string) {
    return value !== '';
  }

  private saveMove(row: number, col: number, type: string, player: string) {
    if (
      this.isMoveValid(row, col, player) &&
      !this.checkWinner(player) &&
      !this.isBoardFull(player)
    ) {
      this.boards[player][row][col] = type;
      this.moves[player].push({ row, col });
    }
  }

  private isGameFinished(player: string): boolean {
    return this.isBoardFull(player) || !!this.checkWinner(player);
  }

  private makeComputerMove(player: string): boolean {
    if (this.isGameFinished(player)) {
      return false; // Game is already finished
    }

    let move: Move | null = null;

    switch (this.difficulty) {
      case 'medium':
        move = this.getBlockMove(player);
        break;
      case 'hard':
        move = this.minimax(true, player).move;
        break;
      default:
        move = this.getRandomMove(player);
    }

    this.saveMove(move.row, move.col, 'o', player);
  }

  private getRandomMove(player: string): Move | null {
    const emptyCells: { row: number; col: number }[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.isMoveValid(i, j, player)) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) {
      return null;
    }

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  private getBlockMove(player: string): Move {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.isMoveValid(i, j, player)) {
          this.boards[player][i][j] = 'o';
          if (this.checkWinner(player) === 'o') {
            this.boards[player][i][j] = '';
            return { row: i, col: j };
          }
          this.boards[player][i][j] = '';
        }
      }
    }

    return this.getRandomMove(player)!;
  }

  private minimax(
    maximizing: boolean,
    player: string,
  ): {
    score: number;
    move?: { row: number; col: number };
  } {
    const winner = this.checkWinner(player);

    if (winner === 'x') {
      return { score: -1 };
    } else if (winner === 'o') {
      return { score: 1 };
    } else if (this.isBoardFull(player)) {
      return { score: 0 };
    }

    if (maximizing) {
      let maxEval = Number.MIN_SAFE_INTEGER;
      let bestMove: { row: number; col: number } | undefined;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.boards[player][i][j] === '') {
            this.boards[player][i][j] = 'o';
            const evaluate = this.minimax(false, player).score;
            this.boards[player][i][j] = '';

            if (evaluate > maxEval) {
              maxEval = evaluate;
              bestMove = { row: i, col: j };
            }
          }
        }
      }

      return { score: maxEval, move: bestMove };
    } else {
      let minEval = Number.MAX_SAFE_INTEGER;
      let bestMove: { row: number; col: number } | undefined;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.boards[player][i][j] === '') {
            this.boards[player][i][j] = 'x';
            const evaluate = this.minimax(true, player).score;
            this.boards[player][i][j] = '';

            if (evaluate < minEval) {
              minEval = evaluate;
              bestMove = { row: i, col: j };
            }
          }
        }
      }

      return { score: minEval, move: bestMove };
    }
  }

  private checkWinner(player: string): string | null {
    const size = this.boards[player].length;

    for (let i = 0; i < size; i++) {
      const rowFirstValue = this.boards[player][i][0];
      const colFirstValue = this.boards[player][0][i];

      if (
        this.isNotEmpty(rowFirstValue) &&
        this.boards[player][i].every((cell) => cell === rowFirstValue)
      ) {
        return rowFirstValue;
      }

      if (
        this.isNotEmpty(colFirstValue) &&
        this.boards[player].every((row) => row[i] === colFirstValue)
      ) {
        return colFirstValue;
      }
    }

    const diagonal1FirstValue = this.boards[player][0][0];
    const diagonal2FirstValue = this.boards[player][0][size - 1];

    if (
      this.isNotEmpty(diagonal1FirstValue) &&
      this.boards[player].every((row, i) => row[i] === diagonal1FirstValue)
    ) {
      return diagonal1FirstValue;
    }

    if (
      this.isNotEmpty(diagonal2FirstValue) &&
      this.boards[player].every(
        (row, i) => row[size - 1 - i] === diagonal2FirstValue,
      )
    ) {
      return diagonal2FirstValue;
    }

    return null; // No winner yet
  }

  private getGameStatus(player: string) {
    const winner = this.checkWinner(player);

    if (!winner && this.isBoardFull(player)) {
      return 'drawn';
    }

    if (winner === 'x') {
      return 'won';
    }

    if (winner === 'o') {
      return 'lost';
    }

    return 'idle';
  }

  create(createGameplayDto: CreateGameplayDto) {
    const player = createGameplayDto.email;

    this.difficulty = createGameplayDto.difficulty;

    if (!this.boards[player]) {
      this.initializeBoard(player);
    }

    this.saveMove(createGameplayDto.row, createGameplayDto.col, 'x', player);
    this.makeComputerMove(player);

    const gameStatus = this.getGameStatus(player);
    const { row: lastRow, col: lastCol } = [...this.moves[player]].pop();

    const data = {
      email: createGameplayDto.email,
      difficulty: createGameplayDto.difficulty,
      status: gameStatus,
      moves: this.moves[player],
    };

    this.gameplayModel
      .findOneAndUpdate(
        { email: createGameplayDto.email, status: 'idle' },
        data,
        {
          upsert: true,
        },
      )
      .exec();

    if (gameStatus !== 'idle') {
      const status = this.getGameStatus(player);

      this.statisticsService.findOneAndUpdate({
        email: createGameplayDto.email,
        won: status === 'won' ? 1 : 0,
        lost: status === 'lost' ? 1 : 0,
        drawn: status === 'drawn' ? 1 : 0,
      });

      this.initializeBoard(player);
    }

    return {
      status: gameStatus,
      row: lastRow,
      col: lastCol,
    };
  }
}
