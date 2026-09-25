import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheckResult, HealthService } from "./health.service.js";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Health Check",
    description:
      "Verifica el estado operativo del servicio y la conectividad con la base de datos PostgreSQL",
  })
  @ApiResponse({
    status: 200,
    description: "API y base de datos operativas",
    schema: {
      example: {
        status: "ok",
        timestamp: "2026-09-25T01:00:00.000Z",
        uptime: 12.34,
        database: {
          status: "up",
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: "Base de datos o servicio no disponible",
    schema: {
      example: {
        statusCode: 503,
        timestamp: "2026-09-25T01:00:00.000Z",
        path: "/api/v1/health",
        method: "GET",
        message: {
          status: "error",
          timestamp: "2026-09-25T01:00:00.000Z",
          uptime: 12.34,
          database: {
            status: "down",
            error: "Connection refused",
          },
        },
      },
    },
  })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
