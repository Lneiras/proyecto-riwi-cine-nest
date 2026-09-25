import { AppDataSource } from "../../config/data-source.js";
import { Country } from "../../location/entities/country.entity.js";
import { Department } from "../../location/entities/department.entity.js";
import { City } from "../../location/entities/city.entity.js";

export async function runInitialLocationsSeed() {
  console.log("🌱 Running initial locations seed...");

  const countryRepo = AppDataSource.getRepository(Country);
  const departmentRepo = AppDataSource.getRepository(Department);
  const cityRepo = AppDataSource.getRepository(City);

  let colombia = await countryRepo.findOne({ where: { name: "Colombia" } });
  if (!colombia) {
    colombia = await countryRepo.save(
      countryRepo.create({
        name: "Colombia",
      }),
    );
    console.log(`  ✓ Created Country: ${colombia.name}`);
  }

  let antioquia = await departmentRepo.findOne({
    where: { name: "Antioquia", countryId: colombia.id },
  });
  if (!antioquia) {
    antioquia = await departmentRepo.save(
      departmentRepo.create({
        name: "Antioquia",
        countryId: colombia.id,
      }),
    );
    console.log(`  ✓ Created Department: ${antioquia.name}`);
  }

  let medellin = await cityRepo.findOne({
    where: { name: "Medellín", departmentId: antioquia.id },
  });
  if (!medellin) {
    medellin = await cityRepo.save(
      cityRepo.create({
        name: "Medellín",
        departmentId: antioquia.id,
      }),
    );
    console.log(`  ✓ Created City: ${medellin.name}`);
  }

  console.log("✅ Initial locations seed completed successfully.");
}

async function runAllSeeds() {
  try {
    await AppDataSource.initialize();
    await runInitialLocationsSeed();
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    process.exit(1);
  }
}

if (
  process.argv[1]?.endsWith("run-seeds.js") ||
  process.argv[1]?.endsWith("run-seeds.ts")
) {
  runAllSeeds();
}
