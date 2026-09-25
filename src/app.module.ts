import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationModule } from "./location/location.module.js";
import { HealthModule } from "./health/health.module.js";
import { validateEnvironment } from "./config/env.validation.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ObserveModule.forRoot({
      appKey: "YOUR_APP_KEY",
      appSecret: "YOUR_APP_SECRET",
      serviceId: "riwi-cine-nest",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        autoLoadEntities: true,
        host: configService.getOrThrow<string>("DB_HOST"),
        port: Number(configService.getOrThrow<number>("DB_PORT")),
        username: configService.getOrThrow<string>("DB_USERNAME"),
        password: configService.getOrThrow<string>("DB_PASSWORD"),
        database: configService.getOrThrow<string>("DB_DATABASE"),
        synchronize:
          configService.get<string | boolean>("DB_SYNCHRONIZE") === true ||
          configService.get<string | boolean>("DB_SYNCHRONIZE") === "true",
      }),
    }),
    LocationModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
