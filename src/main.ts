import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./App/app.module";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import * as session from "express-session";
import Redis from "ioredis";
const RedisStore = require("connect-redis")(session);

async function start() {
  const app = await NestFactory.create(AppModule);
  const redisClient = new Redis();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
    })
  );
  await app.listen(3000, () => console.log("started on 3000"));
  process.on("uncaughtException", function () {});
}
start();
