import { IUser, UserRole } from "@shared/healthcare-types";
import { IApiService } from "../core/interfaces/IApiService";
import { ApiService } from "../core/services/ApiService";

export interface IUserService {
  getDoctors(): Promise<IUser[]>;
  getDoctorById(id: string): Promise<IUser | null>;
  getUsersByRole(role: UserRole): Promise<IUser[]>;
  getAll(): Promise<IUser[]>; // Add this method
}

export class UserService implements IUserService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async getAll(): Promise<IUser[]> {
    try {
      const allUsers = await this.apiService.get<IUser[]>("/users");
      return allUsers;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  async getDoctors(): Promise<IUser[]> {
    try {
      const allUsers = await this.apiService.get<IUser[]>("/users");
      return allUsers.filter(
        (user) => user.role === UserRole.DOCTOR && user.status === "active"
      );
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      throw error;
    }
  }

  async getDoctorById(id: string): Promise<IUser | null> {
    try {
      const user = await this.apiService.get<IUser>(`/users/${id}`);
      return user.role === UserRole.DOCTOR ? user : null;
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
      return null;
    }
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    try {
      const allUsers = await this.apiService.get<IUser[]>("/users");
      return allUsers.filter(
        (user) => user.role === role && user.status === "active"
      );
    } catch (error) {
      console.error(`Failed to fetch users with role ${role}:`, error);
      throw error;
    }
  }
}
