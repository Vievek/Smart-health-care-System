import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IUser, UserRole } from "@shared/healthcare-types";

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);

 useEffect(() => {
   const token = localStorage.getItem("authToken");
   const userData = localStorage.getItem("user");

   if (token && userData) {
     try {
       const parsedUser = JSON.parse(userData);
       // Validate that we have the required user fields
       if (parsedUser && parsedUser._id && parsedUser.role) {
         setUser(parsedUser);
       } else {
         console.warn("Invalid user data in storage");
         logout(); // Clear invalid data
       }
     } catch (error) {
       console.error("Failed to parse user data:", error);
       logout(); // Clear corrupted data
     }
   }
 }, []);

 const login = (token: string, userData: IUser) => {
   try {
     localStorage.setItem("authToken", token);
     localStorage.setItem("user", JSON.stringify(userData));
     setUser(userData);
   } catch (error) {
     console.error("Failed to save auth data:", error);
   }
 };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
