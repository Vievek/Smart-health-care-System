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

  const { user } = useAuth();
  const wardService = new WardService();
  const userService = new UserService();

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load wards, beds, and patients in parallel
      const [wardsData, availableBedsData, allBedsData, allUsers] =
        await Promise.all([
          wardService.getWards(),
          wardService.getAvailableBeds(),
          wardService.getAllBeds(),
          userService.getAll(),
        ]);

      setWards(wardsData);
      setAvailableBeds(availableBedsData);
      setAllBeds(allBedsData);

      // Set patients (filter for patient role)
      const patientUsers = allUsers.filter((p) => p.role === UserRole.PATIENT);
      setPatients(patientUsers);

      // Set initial selected ward
      if (wardsData.length > 0 && !selectedWard) {
        setSelectedWard(wardsData[0]);
      }

      // Load patient beds if user is a patient
      if (user?.role === UserRole.PATIENT && user._id) {
        const patientBedData = await wardService.getBedsByPatient(user._id);
        setPatientBeds(patientBedData);
      }
    } catch (error) {
      console.error("Failed to load ward data:", error);
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

  // FIXED: Get patient name function
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient ${patientId}`;
  };

  // FIXED: Get beds for specific ward
  const getBedsForWard = (wardId: string) => {
    return allBeds.filter((bed) => bed.wardId === wardId);
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
