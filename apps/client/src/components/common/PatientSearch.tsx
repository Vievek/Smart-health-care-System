import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { UserService } from "../../services/UserService";
import { IUser, UserRole } from "@shared/healthcare-types";
import { SearchBar } from "./SearchBar";
import { useApi } from "../../hooks/useApi";

interface PatientSearchProps {
  onPatientSelect: (patient: IUser) => void;
  selectedPatient: IUser | null;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  onPatientSelect,
  selectedPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const userService = new UserService();

  // Load all patients initially like in original code
  const {
    data: allPatients,
    execute: loadPatients,
  } = useApi(() => userService.getUsersByRole(UserRole.PATIENT));

  useEffect(() => {
    loadPatients();
  }, []);

  // FIXED: Real-time filtering like in original code
  const filteredPatients = (allPatients || []).filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.nationalId.toLowerCase().includes(searchLower) ||
      patient._id?.toLowerCase().includes(searchLower)
    );
  });

  const handlePatientSelect = (patient: IUser) => {
    onPatientSelect(patient);
    setShowResults(false);
    setSearchTerm(
      `${patient.firstName} ${patient.lastName} (${patient.nationalId})`
    );
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(true);
  };

  const handleFocus = () => {
    setShowResults(true);
  };

  return (
    <div className="relative flex-1">
      <SearchBar
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search for patient by name, ID, or national ID..."
        onFocus={handleFocus}
      />

      {/* FIXED: Patient Search Results - Better positioning and display like original */}
      {showResults && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-2">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  selectedPatient?._id === patient._id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {patient._id} | National ID: {patient.nationalId}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Select
                </Button>
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No patients found matching "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
