import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("auth_audit_logs")
export class AuthAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "user_id" })
  user: User | null;

  @Column({ type: "varchar", length: 150 })
  email: string;

  @Column({ type: "varchar", length: 50 })
  action: string;

  @Column({ name: "ip_address", type: "varchar", length: 64 })
  ipAddress: string;

  @Column({ name: "user_agent", type: "varchar", length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({ type: "text", nullable: true })
  details: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
