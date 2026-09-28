import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity.js";

@Injectable()
export class UserDao {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.userRepository.update(id, data);
  }

  async recordFailedAttempt(
    user: User,
    maxAttempts: number = 5,
    lockoutDurationMinutes: number = 15,
  ): Promise<{
    isLocked: boolean;
    attempts: number;
    lockoutUntil: Date | null;
  }> {
    user.failedLoginAttempts += 1;

    let isLocked = false;
    let lockoutUntil: Date | null = null;

    if (user.failedLoginAttempts >= maxAttempts) {
      lockoutUntil = new Date(Date.now() + lockoutDurationMinutes * 60 * 1000);
      user.lockoutUntil = lockoutUntil;
      isLocked = true;
    }

    await this.userRepository.save(user);

    return {
      isLocked,
      attempts: user.failedLoginAttempts,
      lockoutUntil,
    };
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
  }
}
