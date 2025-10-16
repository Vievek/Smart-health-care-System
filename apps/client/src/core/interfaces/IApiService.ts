export interface IApiService {
  get<T>(url: string, params?: any): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  patch<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export interface LoginCredentials {
  nationalId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any; // Will be properly typed when User type is available
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): void;
  getCurrentUser(): any | null;
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
}

export interface IStorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
