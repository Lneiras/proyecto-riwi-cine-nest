import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 20, default: "client" })
  role: string;

  @Column({ name: "is_email_verified", type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ name: "failed_login_attempts", type: "int", default: 0 })
  failedLoginAttempts: number;

  @Column({ name: "lockout_until", type: "timestamp", nullable: true })
  lockoutUntil: Date | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
