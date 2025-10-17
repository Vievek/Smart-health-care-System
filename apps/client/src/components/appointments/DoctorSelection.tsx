import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { UserService } from "../../services/UserService";
import { IDoctor } from "@shared/healthcare-types";
import { User, Stethoscope, MapPin, Clock } from "lucide-react";
import { SearchBar } from "../common/SearchBar";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useApi } from "../../hooks/useApi";

interface DoctorSelectionProps {
  onDoctorSelect: (doctor: IDoctor) => void;
  onBack: () => void;
}

export const DoctorSelection: React.FC<DoctorSelectionProps> = ({
  onDoctorSelect,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");

  const userService = new UserService();

  // Cast the doctors to IDoctor type since UserService returns IUser[]
  const {
    data: users,
    loading,
    execute: loadDoctors,
  } = useApi(() => userService.getDoctors());

  const doctors = (users || []) as IDoctor[];

  useEffect(() => {
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.specialization &&
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialization =
      !specializationFilter || doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  const specializations = [
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  if (loading) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search doctors by name or specialization..."
              className="flex-1"
            />
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={onBack}>
              View My Appointments
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              No doctors found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onSelect={() => onDoctorSelect(doctor)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DoctorCard: React.FC<{
  doctor: IDoctor;
  onSelect: () => void;
}> = ({ doctor, onSelect }) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={onSelect}
  >
    <CardHeader className="pb-3">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-lg">
            Dr. {doctor.firstName} {doctor.lastName}
          </CardTitle>
          <div className="flex items-center text-sm text-gray-600">
            <Stethoscope className="w-4 h-4 mr-1" />
            {doctor.specialization || "General Practitioner"}
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {doctor.address || "Hospital Address"}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Available Today
        </div>
      </div>
      <Button className="w-full mt-4">Select Doctor</Button>
    </CardContent>
  </Card>
);
