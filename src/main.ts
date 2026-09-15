import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const configService = app.get(ConfigService);

  //permite que se cumplan los contratos al pie de la letra
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina del objeto cualquier propiedad que no tenga decorador en el DTO
      forbidNonWhitelisted: true, // Lanza un error (400 Bad Request) si el cliente envía propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos (ej: string a number si el DTO lo dice)
    }),
  );

  await app.listen(Number(configService.getOrThrow<string>("PORT")));
}
await bootstrap();
