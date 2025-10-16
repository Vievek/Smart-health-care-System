import {
  IAuthService,
  LoginCredentials,
  AuthResponse,
} from "../interfaces/IApiService";
import { IUser, UserRole } from "@shared/healthcare-types"; // Changed from User to IUser
import { IApiService } from "../interfaces/IApiService";
import { ApiService } from "./ApiService";

export class AuthService implements IAuthService {
  private apiService: IApiService;

  constructor(apiService?: IApiService) {
    this.apiService = apiService || new ApiService("http://localhost:5000/api");
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.apiService.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  }

  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }

  getCurrentUser(): IUser | null {
    // Changed from User to IUser
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
