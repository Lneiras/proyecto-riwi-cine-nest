import { describe, it, expect } from "vitest";
import { validateEnvironment } from "./env.validation.js";

describe("validateEnvironment", () => {
  it("should validate and return config when all required variables are present", () => {
    const validConfig = {
      PORT: "3000",
      DB_HOST: "localhost",
      DB_PORT: "5432",
      DB_USERNAME: "postgres",
      DB_PASSWORD: "secretpassword",
      DB_DATABASE: "cine_db",
      DB_SYNCHRONIZE: "true",
      NODE_ENV: "development",
    };

    const result = validateEnvironment(validConfig);

    expect(result.PORT).toBe(3000);
    expect(result.DB_HOST).toBe("localhost");
    expect(result.DB_PORT).toBe(5432);
    expect(result.DB_USERNAME).toBe("postgres");
    expect(result.DB_PASSWORD).toBe("secretpassword");
    expect(result.DB_DATABASE).toBe("cine_db");
    expect(result.DB_SYNCHRONIZE).toBe(true);
  });

  it("should throw a clear error when a required variable like DB_PASSWORD is missing", () => {
    const invalidConfig = {
      PORT: "3000",
      DB_HOST: "localhost",
      DB_PORT: "5432",
      DB_USERNAME: "postgres",
      // DB_PASSWORD is missing
      DB_DATABASE: "cine_db",
    };

    expect(() => validateEnvironment(invalidConfig)).toThrowError(
      /Missing or invalid required environment variables/,
    );
    expect(() => validateEnvironment(invalidConfig)).toThrowError(
      /DB_PASSWORD/,
    );
  });

  it("should throw an error when multiple required variables are missing", () => {
    const invalidConfig = {
      PORT: "3000",
    };

    try {
      validateEnvironment(invalidConfig);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("DB_HOST");
      expect(error.message).toContain("DB_USERNAME");
      expect(error.message).toContain("DB_PASSWORD");
      expect(error.message).toContain("DB_DATABASE");
    }
  });
});
