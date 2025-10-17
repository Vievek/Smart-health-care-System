import React, { useState, useEffect } from "react";
import { WardService } from "../../services/WardService";
import { UserService } from "../../services/UserService";
import { IWard, IBed, UserRole, IUser } from "@shared/healthcare-types";
import { PatientBedView } from "./PatientBedView";
import { StaffWardView } from "./StaffWardView";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";

export const WardManagement: React.FC = () => {
  const [wards, setWards] = useState<IWard[]>([]);
  const [allBeds, setAllBeds] = useState<IBed[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<IWard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientBeds, setPatientBeds] = useState<IBed[]>([]);
  const [patients, setPatients] = useState<IUser[]>([]);

  const { user } = useAuth();
  const wardService = new WardService();
  const userService = new UserService();

  const { data: wardsData, execute: loadWards } = useApi(() =>
    wardService.getWards()
  );
  const { data: availableBedsData, execute: loadAvailableBeds } = useApi(() =>
    wardService.getAvailableBeds()
  );
  const { data: allBedsData, execute: loadAllBeds } = useApi(() =>
    wardService.getAllBeds()
  );
  const { data: patientBedsData, execute: loadPatientBeds } = useApi(() =>
    user?._id ? wardService.getBedsByPatient(user._id) : Promise.resolve([])
  );

  // FIXED: Load all patients for search
  const { data: allPatients, execute: loadPatients } = useApi(() =>
    userService.getAll()
  );

  useEffect(() => {
    loadWards();
    loadAvailableBeds();
    loadAllBeds();
    loadPatients();
    if (user?.role === UserRole.PATIENT) {
      loadPatientBeds();
    }
  }, [user]);

  useEffect(() => {
    if (wardsData) {
      setWards(wardsData);
      if (wardsData.length > 0 && !selectedWard) {
        setSelectedWard(wardsData[0]);
      }
    }
  }, [wardsData]);

  useEffect(() => {
    if (availableBedsData) setAvailableBeds(availableBedsData);
    if (allBedsData) setAllBeds(allBedsData);
    if (patientBedsData) setPatientBeds(patientBedsData);
    if (allPatients)
      setPatients(allPatients.filter((p) => p.role === UserRole.PATIENT));
  }, [availableBedsData, allBedsData, patientBedsData, allPatients]);

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
      onSelectWard={setSelectedWard}
      onSearchChange={setSearchTerm}
      onRefresh={() => {
        loadWards();
        loadAvailableBeds();
        loadAllBeds();
        loadPatients();
      }}
    />
  );
};
