import React, { useState, useEffect } from "react";
import { WardService } from "../../services/WardService";
import { UserService } from "../../services/UserService";
import { IWard, IBed, UserRole, IUser } from "@shared/healthcare-types";
import { PatientBedView } from "./PatientBedView";
import { StaffWardView } from "./StaffWardView";
import { useAuth } from "../../contexts/AuthContext";

export const WardManagement: React.FC = () => {
  const [wards, setWards] = useState<IWard[]>([]);
  const [allBeds, setAllBeds] = useState<IBed[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<IWard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientBeds, setPatientBeds] = useState<IBed[]>([]);
  const [patients, setPatients] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const wardService = new WardService();
  const userService = new UserService();

  // FIXED: Proper error handling for service calls
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data with proper error handling for each service call
      const [wardsData, availableBedsData, allBedsData, allUsers] =
        await Promise.allSettled([
          wardService.getWards(),
          wardService.getAvailableBeds(),
          wardService.getAllBeds(),
          userService.getAll(),
        ]);

      // Handle each promise result
      const wardsResult =
        wardsData.status === "fulfilled" ? wardsData.value : [];
      const availableBedsResult =
        availableBedsData.status === "fulfilled" ? availableBedsData.value : [];
      const allBedsResult =
        allBedsData.status === "fulfilled" ? allBedsData.value : [];
      const allUsersResult =
        allUsers.status === "fulfilled" ? allUsers.value : [];

      setWards(wardsResult || []);
      setAvailableBeds(availableBedsResult || []);
      setAllBeds(allBedsResult || []);

      // Set patients (filter for patient role)
      const patientUsers = (allUsersResult || []).filter(
        (p) => p.role === UserRole.PATIENT
      );
      setPatients(patientUsers);

      // Set initial selected ward
      if (wardsResult && wardsResult.length > 0 && !selectedWard) {
        setSelectedWard(wardsResult[0]);
      }

      // Load patient beds if user is a patient
      if (user?.role === UserRole.PATIENT && user._id) {
        try {
          const patientBedData = await wardService.getBedsByPatient(user._id);
          setPatientBeds(patientBedData || []);
        } catch (error) {
          console.error("Failed to load patient beds:", error);
          setPatientBeds([]);
        }
      }
    } catch (error) {
      console.error("Failed to load ward data:", error);
      setError("Failed to load ward data. Please try again.");
      // Set empty arrays to prevent undefined errors
      setWards([]);
      setAvailableBeds([]);
      setAllBeds([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const handleRefresh = async () => {
    await loadAllData();
  };

  // Get patient name function with null checks
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient ${patientId}`;
  };

  // Get beds for specific ward with null checks
  const getBedsForWard = (wardId: string) => {
    return (allBeds || []).filter((bed) => bed.wardId === wardId);
  };

  if (loading && wards.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          Loading ward data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadAllData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (user?.role === UserRole.PATIENT) {
    return <PatientBedView patientBeds={patientBeds} wards={wards} />;
  }

  return (
    <StaffWardView
      wards={wards}
      allBeds={allBeds}
      availableBeds={availableBeds}
      selectedWard={selectedWard}
      searchTerm={searchTerm}
      patients={patients}
      getPatientName={getPatientName}
      getBedsForWard={getBedsForWard}
      onSelectWard={setSelectedWard}
      onSearchChange={setSearchTerm}
      onRefresh={handleRefresh}
    />
  );
};
