import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty({ message: "DB_HOST is required" })
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty({ message: "DB_USERNAME is required" })
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty({ message: "DB_PASSWORD is required" })
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty({ message: "DB_DATABASE is required" })
  DB_DATABASE: string;

  @IsBoolean()
  @IsOptional()
  DB_SYNCHRONIZE: boolean = false;
}

export function validateEnvironment(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorDetails = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {}).join(", ");
        return `  • [${error.property}]: ${constraints}`;
      })
      .join("\n");

    throw new Error(
      `\n======================================================\n` +
        `❌ Missing or invalid required environment variables:\n` +
        `======================================================\n` +
        `${errorDetails}\n` +
        `Please check your .env configuration.\n`,
    );
  }

  return validatedConfig;
}
