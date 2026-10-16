import { AppDataSource } from "../../config/data-source.js";
import { Country } from "../../location/entities/country.entity.js";
import { Department } from "../../location/entities/department.entity.js";
import { City } from "../../location/entities/city.entity.js";
import { Cinemas } from "../../cinema/entities/cinemas.entity.js";
import { Room, typeRoom } from "../../cinema/entities/room.entity.js";
import { Movie } from "../../movies/entities/movie.entity.js";
import { AudioType, Showtime } from "../../movies/entities/showtime.entity.js";

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

/** Datos mínimos para probar HU-004 (detalle de película) de punta a punta. */
export async function runSampleMovieSeed(cityId: number) {
  console.log("🌱 Running sample movie seed...");

  const cinemaRepo = AppDataSource.getRepository(Cinemas);
  const roomRepo = AppDataSource.getRepository(Room);
  const movieRepo = AppDataSource.getRepository(Movie);
  const showtimeRepo = AppDataSource.getRepository(Showtime);

  let cinema = await cinemaRepo.findOne({ where: { name: "Cine Riwi Centro" } });
  if (!cinema) {
    cinema = await cinemaRepo.save(
      cinemaRepo.create({
        name: "Cine Riwi Centro",
        cityId,
        address: "Cra 43A # 1-50",
      }),
    );
    console.log(`  ✓ Created Cinema: ${cinema.name}`);
  }

  let room = await roomRepo.findOne({ where: { cinemaId: cinema.id, number: 1 } });
  if (!room) {
    room = await roomRepo.save(
      roomRepo.create({ number: 1, type: typeRoom.IMAX, cinemaId: cinema.id }),
    );
    console.log(`  ✓ Created Room: ${room.number} (${room.type})`);
  }

  let movie = await movieRepo.findOne({ where: { name: "Dune: Parte Dos" } });
  if (!movie) {
    movie = await movieRepo.save(
      movieRepo.create({
        name: "Dune: Parte Dos",
        durationMinutes: 166,
        rating: "PG-13",
        genres: ["Ciencia ficción", "Aventura"],
        synopsis:
          "Paul Atreides se une a Chani y los Fremen para vengarse de los conspiradores que destruyeron a su familia.",
        director: "Denis Villeneuve",
        actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        releaseDate: "2026-03-01",
        posterUrl: "https://example.com/dune2-poster.jpg",
        bannerUrl: "https://example.com/dune2-banner.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        averageRating: "4.60",
      } as unknown as Movie),
    );
    console.log(`  ✓ Created Movie: ${movie.name}`);
  }

  const existingShowtime = await showtimeRepo.findOne({
    where: { movieId: movie.id, roomId: room.id },
  });
  if (!existingShowtime) {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    startsAt.setHours(20, 0, 0, 0);

    await showtimeRepo.save(
      showtimeRepo.create({
        movieId: movie.id,
        roomId: room.id,
        language: "Español",
        audioType: AudioType.SUBTITLED,
        startsAt,
        price: "18000.00",
      } as unknown as Showtime),
    );
    console.log(`  ✓ Created Showtime for: ${movie.name}`);
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
