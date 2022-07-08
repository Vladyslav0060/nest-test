import { Request, Response } from "express";

export type gameModes = "normal" | "testing";
export type betTypes = number | "odd" | "even";

export interface ICreate extends Request {
  balance: number | string;
  gameMode: string;
}

export interface ISpin {
  betAmount: number;
  betType: number | betTypes;
}
