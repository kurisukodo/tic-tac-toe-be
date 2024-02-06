import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticsService } from 'src/statistics/statistics.service';
import { CreateGameplayDto } from './dto/create-gameplay.dto';
import { Gameplay } from './schemas/gameplay.schema';

type Move = {
  row: number;
  col: number;
};

@Injectable()
export class GameplaysService {
  @Inject(StatisticsService)
  private readonly statisticsService: StatisticsService;

  private board: string[][];
  private moves: Move[];
  private difficulty: string;

  constructor(
    @InjectModel(Gameplay.name) private gameplayModel: Model<Gameplay>,
  ) {
    this.initializeBoard();
  }

  private initializeBoard(size: number = 3) {
    this.board = Array.from({ length: size }, () => Array(size).fill(''));
    this.moves = [];
  }

  private isBoardFull(): boolean {
    return this.board.every((row) => row.every((cell) => cell !== ''));
  }

  private isMovevaluateuateid(row: number, col: number): boolean {
    return this.board[row][col] === '';
  }

  private isNotEmpty(value: string) {
    return value !== '';
  }

  private saveMove(row: number, col: number, type: string) {
    if (
      this.isMovevaluateuateid(row, col) &&
      !this.checkWinner() &&
      !this.isBoardFull()
    ) {
      this.board[row][col] = type;
      this.moves.push({ row, col });
    }
  }

  private isGameFinished(): boolean {
    return this.isBoardFull() || !!this.checkWinner();
  }

  private makeComputerMove(): boolean {
    if (this.isGameFinished()) {
      return false; // Game is already finished
    }

    let move: Move | null = null;

    switch (this.difficulty) {
      case 'medium':
        move = this.getBlockMove();
        break;
      case 'hard':
        move = this.minimax(true).move;
        break;
      default:
        move = this.getRandomMove();
    }

    this.saveMove(move.row, move.col, 'o');
  }

  private getRandomMove(): Move | null {
    const emptyCells: { row: number; col: number }[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.isMovevaluateuateid(i, j)) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) {
      return null;
    }

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  private getBlockMove(): Move {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.isMovevaluateuateid(i, j)) {
          this.board[i][j] = 'o';
          if (this.checkWinner() === 'o') {
            this.board[i][j] = '';
            return { row: i, col: j };
          }
          this.board[i][j] = '';
        }
      }
    }

    return this.getRandomMove()!;
  }

  private minimax(maximizing: boolean): {
    score: number;
    move?: { row: number; col: number };
  } {
    const winner = this.checkWinner();

    if (winner === 'x') {
      return { score: -1 };
    } else if (winner === 'o') {
      return { score: 1 };
    } else if (this.isBoardFull()) {
      return { score: 0 };
    }

    if (maximizing) {
      let maxEval = Number.MIN_SAFE_INTEGER;
      let bestMove: { row: number; col: number } | undefined;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.board[i][j] === '') {
            this.board[i][j] = 'o';
            const evaluate = this.minimax(false).score;
            this.board[i][j] = '';

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
          if (this.board[i][j] === '') {
            this.board[i][j] = 'x';
            const evaluate = this.minimax(true).score;
            this.board[i][j] = '';

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

  private checkWinner(): string | null {
    const size = this.board.length;

    for (let i = 0; i < size; i++) {
      const rowFirstValue = this.board[i][0];
      const colFirstValue = this.board[0][i];

      if (
        this.isNotEmpty(rowFirstValue) &&
        this.board[i].every((cell) => cell === rowFirstValue)
      ) {
        return rowFirstValue;
      }

      if (
        this.isNotEmpty(colFirstValue) &&
        this.board.every((row) => row[i] === colFirstValue)
      ) {
        return colFirstValue;
      }
    }

    const diagonal1FirstValue = this.board[0][0];
    const diagonal2FirstValue = this.board[0][size - 1];

    if (
      this.isNotEmpty(diagonal1FirstValue) &&
      this.board.every((row, i) => row[i] === diagonal1FirstValue)
    ) {
      return diagonal1FirstValue;
    }

    if (
      this.isNotEmpty(diagonal2FirstValue) &&
      this.board.every((row, i) => row[size - 1 - i] === diagonal2FirstValue)
    ) {
      return diagonal2FirstValue;
    }

    return null; // No winner yet
  }

  private getGameStatus() {
    if (!this.checkWinner() && this.isBoardFull()) {
      return 'drawn';
    }

    if (this.checkWinner() === 'x') {
      return 'won';
    }

    if (this.checkWinner() === 'o') {
      return 'lost';
    }

    return 'idle';
  }

  create(createGameplayDto: CreateGameplayDto) {
    this.difficulty = createGameplayDto.difficulty;
    this.saveMove(createGameplayDto.row, createGameplayDto.col, 'x');
    this.makeComputerMove();

    const gameStatus = this.getGameStatus();
    const { row: lastRow, col: lastCol } = [...this.moves].pop();

    const data = {
      email: createGameplayDto.email,
      difficulty: createGameplayDto.difficulty,
      status: gameStatus,
      moves: this.moves,
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
      const status = this.getGameStatus();

      this.statisticsService.findOneAndUpdate({
        email: createGameplayDto.email,
        won: status === 'won' ? 1 : 0,
        lost: status === 'lost' ? 1 : 0,
        drawn: status === 'drawn' ? 1 : 0,
      });

      this.initializeBoard();
    }

    return {
      status: gameStatus,
      row: lastRow,
      col: lastCol,
    };
  }
}
