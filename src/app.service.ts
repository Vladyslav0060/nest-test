import { HttpException, Injectable, Session } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AppService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(token: string) {
    return this.jwtService.verify(token).balance;
  }

  calculateWin(bet: any, session: any, winningNumber: number = null) {
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

  create(req: any): number {
    try {
      const session = req.session;
      if (session.balance) throw new Error("Ongoing session is not ended");
      const { balance, gameMode } = req.body;
      if (gameMode === "normal") session.balance = this.verifyToken(balance);
      else session.balance = balance;
      session.gameMode = gameMode;
      session.startBalance = session.balance;
      return session.balance;
    } catch (error) {
      throw new HttpException(`Error ${error}`, 403);
    }
  }

  spin(req: any): any {
    try {
      const { body, session } = req;
      body.bets.forEach((bet: any) => {
        if (bet.betAmount > session.balance)
          throw new HttpException("Insufficient funds on balance", 400);
        const randomWinningNumber = Math.floor(Math.random() * 37);
        this.calculateWin(bet, session, randomWinningNumber);
        console.log(session);
      });
      return session.balance;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 403);
    }
  }

  end(session: any): object {
    try {
      const { startBalance, balance } = session;
      session.destroy();
      console.log("session ended");
      return { startBalance: startBalance, endBalance: balance };
    } catch (error) {
      throw new HttpException(error, 404);
    }
  }
}
