import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { DataSource } from "typeorm";

export interface HealthCheckResult {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  database: {
    status: "up" | "down";
    error?: string;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    try {
      if (!this.dataSource.isInitialized) {
        throw new Error("Database connection is not initialized");
      }

      await this.dataSource.query("SELECT 1");

      return {
        status: "ok",
        timestamp,
        uptime,
        database: {
          status: "up",
        },
      };
    } catch (error: any) {
      this.logger.error(`Database health check failed: ${error.message}`);
      throw new ServiceUnavailableException({
        status: "error",
        timestamp,
        uptime,
        database: {
          status: "down",
          error: error.message || "Database connection error",
        },
      });
    }
  }
}
