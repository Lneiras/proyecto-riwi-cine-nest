import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  token: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @Column({ name: "is_used", type: "boolean", default: false })
  isUsed: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
