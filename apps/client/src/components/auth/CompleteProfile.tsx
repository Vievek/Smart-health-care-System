import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ApiService } from "../../core/services/ApiService";

export const CompleteProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    nationalId: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      try {
        const payloadBase64 = tokenParam.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.id) {
          setUserId(decodedPayload.id);
        }
      } catch (err) {
        console.error("Invalid token format");
      }
    } else {
      setError("Authorization token missing.");
    }
  }, [location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !userId) {
      setError("Invalid session. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiService = new ApiService("http://localhost:5000/api");

      // Temporarily set token so API calls work
      localStorage.setItem("authToken", token);

      const response = await apiService.post<{ token: string; user: any }>(
        "/auth/complete-profile",
        {
          userId,
          ...formData,
        }
      );

      // Login with full credentials
      login(response.token, response.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to complete profile");
      console.error("Complete profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete your profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We need a few more details to set up your patient account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
                National ID *
              </label>
              <input
                id="nationalId"
                name="nationalId"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nationalId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                Emergency Contact *
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
