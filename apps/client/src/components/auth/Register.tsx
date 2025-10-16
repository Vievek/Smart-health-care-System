import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ApiService } from "../../core/services/ApiService";
import { UserRole } from "@shared/healthcare-types";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nationalId: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: UserRole.PATIENT,
    // Patient specific
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
    insuranceInfo: "",
    // Doctor specific
    specialization: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

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
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const apiService = new ApiService("http://localhost:5000/api");

      // Prepare registration data based on role
      const registrationData: any = {
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        address: formData.address,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === UserRole.PATIENT) {
        registrationData.dateOfBirth = formData.dateOfBirth;
        registrationData.gender = formData.gender;
        registrationData.emergencyContact = formData.emergencyContact;
        registrationData.insuranceInfo = formData.insuranceInfo;
      } else if (formData.role === UserRole.DOCTOR) {
        registrationData.specialization = formData.specialization;
        registrationData.licenseNumber = formData.licenseNumber;
      }

      // Register the user and get the response with proper typing
      const response = await apiService.post<{ token: string; user: any }>(
        "/auth/register",
        registrationData
      );

      // Use the token and user from the registration response directly
      login(response.token, response.user);
      navigate("/medical-records");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our healthcare system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>

              <div>
                <label
                  htmlFor="nationalId"
                  className="block text-sm font-medium text-gray-700"
                >
                  National ID *
                </label>
                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your national ID"
                  value={formData.nationalId}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role-specific and Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Account Details
              </h3>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value={UserRole.PATIENT}>Patient</option>
                  <option value={UserRole.DOCTOR}>Doctor</option>
                  <option value={UserRole.NURSE}>Nurse</option>
                  <option value={UserRole.PHARMACIST}>Pharmacist</option>
                </select>
              </div>

              {/* Patient Specific Fields */}
              {formData.role === UserRole.PATIENT && (
                <>
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date of Birth *
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <label
                      htmlFor="emergencyContact"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Emergency Contact *
                    </label>
                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Emergency contact number"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="insuranceInfo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Insurance Information
                    </label>
                    <input
                      id="insuranceInfo"
                      name="insuranceInfo"
                      type="text"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Insurance details (optional)"
                      value={formData.insuranceInfo}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Doctor Specific Fields */}
              {formData.role === UserRole.DOCTOR && (
                <>
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Medical specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="licenseNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Medical license number"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Security */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
