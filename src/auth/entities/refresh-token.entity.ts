import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 500, unique: true })
  token: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @Column({ name: "is_revoked", type: "boolean", default: false })
  isRevoked: boolean;

  @Column({
    name: "replaced_by_token",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  replacedByToken: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
