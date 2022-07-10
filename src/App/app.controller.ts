import { Controller, Post, Req, Res, Patch, Delete } from "@nestjs/common";
import { Response } from "express";
import { AppService } from "./app.service";
import { ICreate, ISpin } from "../types/types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("create")
  create(@Req() req: ICreate, @Res() res: Response) {
    return res.json(this.appService.create(req));
  }

  @Patch("spin")
  spin(@Req() req: ISpin, @Res() res: Response) {
    return res.json(this.appService.spin(req));
  }

  @Delete("end")
  end(@Req() req: any, @Res() res: Response) {
    res.json(this.appService.end(req.session));
  }
}
