import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Department } from "./department.entity.js";

@Entity("countries")
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // A country can have multiple departments.
  @OneToMany(() => Department, (department) => department.country)
  departments: Department[];
}
