import { Controller, Get, Post, Req, Res, Session } from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("create")
  getHello(@Req() req: any, @Res() res: any) {
    const session = req.session;
    session.balance = req.body.balance;
    res.send("123213");
    // return this.appService.getHello();
  }

  @Get("test")
  getTest(@Req() request: Request): string {
    console.log(request.session, new Date());
    // request.session.aboba = new Date().toString();
    return `${process.env.SECRET} asasdas`;
  }
}
