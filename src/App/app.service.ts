import { HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IBet, ICreate, ISpin } from "../types/types";

@Injectable()
export class AppService {
  constructor(private readonly jwtService: JwtService) {}

  private getBalance(balance: string | number) {
    return typeof balance === "string"
      ? this.jwtService.verify(balance).balance
      : balance;
  }

  private calculateWin(bet: IBet, session: any, winningNumber: number) {
    switch (bet.betType) {
      case "even":
        winningNumber % 2 == 0
          ? (session.balance += bet.betAmount)
          : (session.balance -= bet.betAmount);
        break;
      case "odd":
        winningNumber % 2 !== 0
          ? (session.balance += bet.betAmount)
          : (session.balance -= bet.betAmount);
        break;
      default:
        winningNumber === bet.betType
          ? (session.balance += bet.betAmount * 36)
          : (session.balance -= bet.betAmount);
        break;
    }
  }

  private validationCreate(req: ICreate) {
    const { balance, gameMode } = req.body;
    if (req.session?.balance)
      throw new HttpException("Ongoing session is not ended", 403);
    if (gameMode === "normal" && typeof balance === "string") {
      if (!this.jwtService.verify(balance))
        throw new HttpException("Invalid token", 403);
    } else if (gameMode === "testing" && typeof balance === "number") {
      return;
    } else throw new HttpException("Invalid balance", 400);
  }

  private validationSpin(bets: IBet[], balance: number) {
    let sumAccumulator = 0;
    bets.forEach((bet: IBet) => {
      if (bet.betType < 0 || bet.betType > 36)
        throw new HttpException("Incorrect type of bet", 400);
      sumAccumulator += bet.betAmount;
    });
    if (sumAccumulator > balance)
      throw new HttpException("Insufficient funds on balance", 403);
  }

  create(req: ICreate): number {
    const { session, body } = req;
    this.validationCreate(req);
    session.balance = this.getBalance(body.balance);
    session.gameMode = req.body.gameMode;
    session.startBalance = session.balance;
    return session.balance;
  }

  spin(req: ISpin): number {
    const { body, session } = req;
    this.validationSpin(body.bets, session.balance);
    body.bets.forEach((bet: any) => {
      if (bet.betAmount > session.balance)
        throw new HttpException("Insufficient funds on balance", 403);
      else if (bet.betType < 0 || bet.betType > 36)
        throw new HttpException("Insufficient funds on balance", 400);
      const randomWinningNumber = Math.floor(Math.random() * 37);
      this.calculateWin(bet, session, randomWinningNumber);
    });
    return session.balance;
  }

  end(session: any): object {
    if (!session.balance)
      throw new HttpException("Ongoing session is ended already", 403);
    const { startBalance, balance } = session;
    session.destroy();
    return { startBalance: startBalance, endBalance: balance };
  }
}
