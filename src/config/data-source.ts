import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { Country } from "../location/entities/country.entity.js";
import { Department } from "../location/entities/department.entity.js";
import { City } from "../location/entities/city.entity.js";

config();

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres123",
  database: process.env.DB_DATABASE || "postgres",
  entities: [Country, Department, City],
  migrations: ["dist/database/migrations/*.js"],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.NODE_ENV === "development",
};

export const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
