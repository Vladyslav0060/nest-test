import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    JwtModule.register({ secret: process.env.SECRET }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
