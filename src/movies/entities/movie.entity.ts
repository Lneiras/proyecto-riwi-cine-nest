import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from "typeorm";

@Entity('movies')
// 📌 Migración de los índices de Sequelize
@Index(['genreId'])
@Index(['statusId'])
@Index(['rating'])
export class Movie {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150, nullable: false })
    title: string;

    @Column({ type: 'int', nullable: false })
    // Nota: @Min(1) va en tu CreateMovieDto para validación HTTP, 
    // pero si usas class-validator en la entidad, déjalo aquí.
    durationMinutes: number;

    // 🔴 Corregido: En TypeORM no existe el tipo 'string', se usa 'varchar'
    @Column({ type: 'varchar', length: 10, nullable: false })
    rating: string;

    @Column({ type: 'int', nullable: false })
    genreId: number;

    // 📌 Campos faltantes migrados:

    @Column({ type: 'text', nullable: true })
    synopsis: string | null;

    @Column({ type: 'date', nullable: true }) // 'date' equivale a DATEONLY (sin hora)
    releaseDate: Date | string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    posterUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    bannerUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    trailerUrl: string | null;

    @Column({ type: 'int', nullable: false })
    statusId: number;

    // 📌 Migración de 'timestamps: true' de Sequelize
    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
}

