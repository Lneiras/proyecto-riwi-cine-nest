import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Department } from "./department.entity.js";

@Entity("cities")
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ name: "department_id", type: "int" })
  departmentId: number;

  // A city belongs to a department.
  @ManyToOne(() => Department, (department) => department.cities, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "department_id" })
  department: Department;
}
