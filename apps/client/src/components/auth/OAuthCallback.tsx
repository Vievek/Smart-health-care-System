import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiService } from "../../core/services/ApiService";
import { IUser } from "@shared/healthcare-types";

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");

      if (!token) {
        setError("No token provided");
        return;
      }

      try {
        // Decode token payload to get user ID
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userId = decodedPayload.id;

        if (!userId) {
          throw new Error("Invalid token payload");
        }

        // Temporarily set token for ApiService
        localStorage.setItem("authToken", token);

        // Fetch full user profile
        const apiService = new ApiService("http://localhost:5000/api");
        const user = await apiService.get<IUser>(`/users/${userId}`);

        // Update auth context
        login(token, user);
        
        // Redirect to dashboard based on role
        navigate("/");
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError("Authentication failed. Please try logging in again.");
        localStorage.removeItem("authToken");
      }
    };

    handleCallback();
  }, [location, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded shadow-md text-center">
          <h2 className="text-xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};
