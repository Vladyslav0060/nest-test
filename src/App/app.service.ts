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
    const { session, body, headers } = req;
    const token = headers.authorization.split("Bearer ")[1];
    if (session?.balance)
      throw new HttpException("Ongoing session is not ended", 403);
    if (body.gameMode === "normal") {
      if (typeof this.jwtService.verify(token).balance !== "number")
        throw new HttpException("Invalid token", 401);
      return;
    } else if (body.gameMode === "testing" && typeof body.balance === "number")
      return;
    else throw new HttpException("Invalid balance", 400);
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
    const { session, body, headers } = req;
    const token = headers.authorization.split("Bearer ")[1];
    this.validationCreate(req);
    session.balance = this.getBalance(
      body.gameMode === "normal" ? token : body.balance
    );
    session.gameMode = req.body.gameMode;
    session.startBalance = session.balance;
    return session.balance;
  }

  spin(req: ISpin): number {
    const { body, session } = req;
    this.validationSpin(body.bets, session.balance);
    body.bets.forEach((bet: IBet) => {
      if (bet.betAmount > session.balance)
        throw new HttpException("Insufficient funds on balance", 403);
      else if (bet.betType < 0 || bet.betType > 36)
        throw new HttpException("Insufficient funds on balance", 400);
      if (
        typeof bet.betType === "number" &&
        bet.winningNumber &&
        session.gameMode === "testing"
      ) {
        this.calculateWin(bet, session, bet.winningNumber);
        return;
      }
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
