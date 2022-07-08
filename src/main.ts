import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as session from "express-session";
import * as redis from "redis";
const RedisStore = require("connect-redis")(session);
const Redis = require("ioredis");

async function start() {
  const app = await NestFactory.create(AppModule);
  const redisClient = new Redis();
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
    })
  );
  redisClient.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
  });
  redisClient.on("connect", function (err) {
    console.log("Connected to redis successfully");
  });

  await app.listen(3000);
  process.on("uncaughtException", function () {});
}
start();
