import {
  Controller,
  Post,
  Req,
  Res,
  Patch,
  HttpException,
  HttpCode,
  Delete,
  Session,
} from "@nestjs/common";
import { Request, Response } from "express";
import session from "express-session";
import { AppService } from "./app.service";
import { gameModes, ICreate } from "./types/types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("create")
  create(@Req() req: any, @Res() res: Response) {
    return res.json(this.appService.create(req));
  }

  @Patch("spin")
  spin(@Req() req: any, @Res() res: Response) {
    return res.json(this.appService.spin(req));
  }
  @Delete("end")
  end(@Req() req: any, @Res() res: any) {
    console.log(req.session);
    res.json(this.appService.end(req.session));
  }
}
