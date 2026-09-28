import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule, ObserveInstrument } from "./app.module.js";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Permite cargar la UI de Swagger sin restricciones CSP
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["api-docs", "api-docs-json"],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Riwi Cine API")
    .setDescription(
      "API REST para la plataforma Cine Riwi (gestión de ubicaciones, películas, salas y reservas)",
    )
    .setVersion("1.0.0")
    .addTag("Health", "Verificación de estado operativo y base de datos")
    .addTag("Locations", "Endpoints de gestión geográfica y ubicaciones")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(configService.get<number>("PORT") ?? 3000);
  await app.listen(port);

  logger.log(`🚀 Application running at: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation at: http://localhost:${port}/api-docs`);
  logger.log(
    `🩺 Health check endpoint at: http://localhost:${port}/api/v1/health`,
  );
}

await bootstrap();
