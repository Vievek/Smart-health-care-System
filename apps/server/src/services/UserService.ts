import { IUser, UserRole } from "@shared/healthcare-types";
import { UserRepository } from "../repositories/UserRepository.js";
import { IService } from "../core/interfaces/IService.js";
import bcrypt from "bcryptjs";

export class UserService implements IService<IUser> {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  async getById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async getAll(filter?: any): Promise<IUser[]> {
    return this.userRepository.findAll(filter);
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 12);
    }
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 12);
    }
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async validateCredentials(
    nationalId: string,
    password: string
  ): Promise<IUser | null> {
    const user = await this.userRepository.findByNationalId(nationalId);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async createTemporaryJudicialAccess(judicialData: any): Promise<IUser> {
    const accessExpiry = new Date();
    accessExpiry.setDate(accessExpiry.getDate() + 7);

    return this.create({
      ...judicialData,
      role: UserRole.JUDICIAL,
      accessExpiry,
      status: "active",
    } as any);
  }
}
