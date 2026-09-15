import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { City } from "./city.entity.js";
import { Country } from "./country.entity.js";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ name: "country_id", type: "int" })
  countryId: number;

  // A department belongs to a country.
  @ManyToOne(() => Country, (country) => country.departments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "country_id" })
  country: Country;

  // A department can have multiple cities.
  @OneToMany(() => City, (city) => city.department)
  cities: City[];
}
