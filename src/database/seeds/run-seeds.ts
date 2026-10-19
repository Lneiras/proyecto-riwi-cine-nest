import { AppDataSource } from "../../config/data-source.js";
import { Country } from "../../location/entities/country.entity.js";
import { Department } from "../../location/entities/department.entity.js";
import { City } from "../../location/entities/city.entity.js";
import { Cinemas } from "../../cinema/entities/cinemas.entity.js";
import { Room, typeRoom } from "../../cinema/entities/room.entity.js";
import { Movie, MovieClassification } from "../../movie/entities/movie.entity.js";
import { Format } from "../../movie/entities/format.entity.js";
import { Showtime } from "../../movie/entities/showtime.entity.js";
import {
  FunctionLanguage,
  MovieFunction,
} from "../../movie/entities/function.entity.js";

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

  return { medellin };
}

/** Datos mínimos para probar la cartelera (HU-003) y el detalle (HU-004). */
export async function runSampleMovieSeed(cityId: number) {
  console.log("🌱 Running sample movie seed...");

  const cinemaRepo = AppDataSource.getRepository(Cinemas);
  const roomRepo = AppDataSource.getRepository(Room);
  const formatRepo = AppDataSource.getRepository(Format);
  const showtimeRepo = AppDataSource.getRepository(Showtime);
  const movieRepo = AppDataSource.getRepository(Movie);
  const functionRepo = AppDataSource.getRepository(MovieFunction);

  let cinema = await cinemaRepo.findOne({
    where: { name: "Riwi Cine El Poblado" },
  });
  if (!cinema) {
    cinema = await cinemaRepo.save(
      cinemaRepo.create({
        name: "Riwi Cine El Poblado",
        cityId,
        address: "Cra 43A # 1-50",
      }),
    );
    console.log(`  ✓ Created Cinema: ${cinema.name}`);
  }

  let room = await roomRepo.findOne({
    where: { cinemaId: cinema.id, number: 1 },
  });
  if (!room) {
    room = await roomRepo.save(
      roomRepo.create({ number: 1, type: typeRoom.IMAX, cinemaId: cinema.id }),
    );
    console.log(`  ✓ Created Room: ${room.number} (${room.type})`);
  }

  let format = await formatRepo.findOne({ where: { name: "IMAX" } });
  if (!format) {
    format = await formatRepo.save(formatRepo.create({ name: "IMAX" }));
    console.log(`  ✓ Created Format: ${format.name}`);
  }

  let showtime = await showtimeRepo.findOne({
    where: { startTime: "23:00:00" },
  });
  if (!showtime) {
    showtime = await showtimeRepo.save(
      showtimeRepo.create({ startTime: "23:00:00" }),
    );
    console.log(`  ✓ Created Showtime: ${showtime.startTime}`);
  }

  let movie = await movieRepo.findOne({ where: { title: "Dune: Parte Dos" } });
  if (!movie) {
    movie = await movieRepo.save(
      movieRepo.create({
        title: "Dune: Parte Dos",
        posterUrl: "https://example.com/dune2-poster.jpg",
        genre: "Ciencia ficción",
        classification: MovieClassification.MAYORES_12,
        durationMinutes: 166,
        synopsis:
          "Paul Atreides se une a Chani y los Fremen para vengarse de los conspiradores que destruyeron a su familia.",
        director: "Denis Villeneuve",
        actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        releaseDate: "2026-03-01",
        bannerUrl: "https://example.com/dune2-banner.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        averageRating: 4.6,
      } as unknown as Movie),
    );
    console.log(`  ✓ Created Movie: ${movie.title}`);
  }

  // Función de hoy (hora de Colombia) a las 11 p. m., para que siga siendo
  // "futura" casi todo el día al probar.
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
  const existing = await functionRepo.findOne({
    where: { movieId: movie.id, roomId: room.id, functionDate: today },
  });
  if (!existing) {
    await functionRepo.save(
      functionRepo.create({
        movieId: movie.id,
        roomId: room.id,
        formatId: format.id,
        showtimeId: showtime.id,
        functionDate: today,
        basePrice: 18000,
        language: FunctionLanguage.SUBTITULADA,
      } as unknown as MovieFunction),
    );
    console.log(`  ✓ Created Function for: ${movie.title} on ${today}`);
  }

  console.log("✅ Sample movie seed completed successfully.");
}

async function runAllSeeds() {
  try {
    await AppDataSource.initialize();
    const { medellin } = await runInitialLocationsSeed();
    await runSampleMovieSeed(medellin.id);
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
