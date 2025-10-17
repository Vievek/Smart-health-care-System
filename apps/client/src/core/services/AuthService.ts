import {
  IAuthService,
  LoginCredentials,
  AuthResponse,
} from "../interfaces/IApiService";
import { IUser, UserRole } from "@shared/healthcare-types";
import { IApiService } from "../interfaces/IApiService";
import { ApiService } from "./ApiService";

export class AuthService implements IAuthService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("AuthService: Attempting login with", credentials.nationalId);
      const response = await this.apiService.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      if (response.token && response.user) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        console.log("AuthService: Login successful, user:", response.user);
      } else {
        throw new Error("Invalid response from server");
      }

      return response;
    } catch (error: any) {
      console.error("AuthService: Login failed:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }

  getCurrentUser(): IUser | null {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      // Validate required fields
      if (user && user._id && user.role) {
        return user;
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
