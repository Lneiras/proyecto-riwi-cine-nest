import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Tabla "formats": catálogo de formatos de proyección (2D, 3D, IMAX, 4DX...).

@Entity("formats")
export class Format {
  @PrimaryGeneratedColumn()
  id: number;

  // unique: no pueden existir dos formatos con el mismo nombre.
  @Column({ type: "varchar", length: 30, unique: true })
  name: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;
}
