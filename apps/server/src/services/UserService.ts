import { IUser, UserRole } from "@shared/healthcare-types";
import { UserRepository } from "../repositories/UserRepository.js";
import { IService } from "../core/interfaces/IService.js";
import bcrypt from "bcryptjs";

export class UserService implements IService<IUser> {
  public userRepository: UserRepository; // Make it public so we can access it

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async getAll(filter?: any): Promise<IUser[]> {
    return this.userRepository.findAll(filter);
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async validateCredentials(
    nationalId: string,
    password: string
  ): Promise<IUser | null> {
    const user =
      await this.userRepository.findByNationalIdWithPassword(nationalId);
    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async findByNationalId(nationalId: string): Promise<IUser | null> {
    return this.userRepository.findByNationalId(nationalId);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByOAuthId(oauthProvider: string, oauthId: string): Promise<IUser | null> {
    return this.userRepository.findByOAuthId(oauthProvider, oauthId);
  }

  async createFromOAuth(profile: any): Promise<IUser> {
    const email = profile.emails[0].value;
    const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "Unknown";
    const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "Unknown";
    
    // Create an inactive or pending user by default until profile is complete
    return this.create({
      email,
      firstName,
      lastName,
      oauthProvider: profile.provider,
      oauthId: profile.id,
      role: UserRole.PATIENT, // default role for public registration
      status: "inactive" as any, // "inactive" indicates missing profile data
    });
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
