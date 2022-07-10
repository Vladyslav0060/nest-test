export type gameModes = "normal" | "testing";
export type betTypes = number | "odd" | "even";

interface ISession {
  balance?: number;
  gameMode?: gameModes;
  startBalance?: number;
}

export type IBet = {
  betAmount: number;
  betType: betTypes;
};

export interface ISpin {
  session: ISession;
  body: {
    bets: [IBet];
  };
}

export interface ICreate {
  session: ISession;
  body: {
    gameMode: gameModes;
    balance: number | string;
  };
}
