import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { AppointmentService } from "../../services/AppointmentService";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar } from "lucide-react";
import { DoctorSelection } from "./DoctorSelection";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { AppointmentConfirmation } from "./AppointmentConfirmation";
import { AppointmentList } from "./AppointmentList";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useApi } from "../../hooks/useApi";
import { IDoctor } from "@shared/healthcare-types";

type AppointmentStep =
  | "select-doctor"
  | "select-slot"
  | "confirmation"
  | "my-appointments";

export const AppointmentBooking: React.FC = () => {
  const [step, setStep] = useState<AppointmentStep>("my-appointments");
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { user } = useAuth();
  const appointmentService = new AppointmentService();

  const {
    data: appointments,
    loading: appointmentsLoading,
    execute: loadAppointments,
  } = useApi(() => appointmentService.getAppointments());

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleDoctorSelect = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep("select-slot");
  };

  const handleSlotSelect = (slot: string, date: Date) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setStep("confirmation");
  };

  const handleAppointmentBooked = () => {
    setStep("my-appointments");
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    loadAppointments(); // Refresh the list
  };

  const handleBackToAppointments = () => {
    setStep("my-appointments");
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const renderStepContent = () => {
    switch (step) {
      case "my-appointments":
        return (
          <AppointmentList
            appointments={appointments || []}
            onBookNewAppointment={() => setStep("select-doctor")}
          />
        );

      case "select-doctor":
        return (
          <DoctorSelection
            onDoctorSelect={handleDoctorSelect}
            onBack={handleBackToAppointments}
          />
        );

      case "select-slot":
        return selectedDoctor ? (
          <TimeSlotSelection
            doctor={selectedDoctor}
            appointments={appointments || []}
            onSlotSelect={handleSlotSelect}
            onBack={() => setStep("select-doctor")}
          />
        ) : null;

      case "confirmation":
        return selectedDoctor && selectedDate && selectedSlot ? (
          <AppointmentConfirmation
            doctor={selectedDoctor}
            date={selectedDate}
            slot={selectedSlot}
            onConfirm={handleAppointmentBooked}
            onBack={() => setStep("select-slot")}
          />
        ) : null;

      default:
        return null;
    }
  };

  if (appointmentsLoading && !appointments) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner text="Loading appointments..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AppointmentHeader
        userRole={user?.role}
        step={step}
        onBookNewAppointment={() => setStep("select-doctor")}
      />

      {step !== "my-appointments" && <AppointmentProgress step={step} />}

      {renderStepContent()}
    </div>
  );
};

// Sub-components for AppointmentBooking
const AppointmentHeader: React.FC<{
  userRole?: string;
  step: AppointmentStep;
  onBookNewAppointment: () => void;
}> = ({ userRole, step, onBookNewAppointment }) => {
  if (step !== "my-appointments") return null;

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {userRole === "doctor"
            ? "Doctor Appointments"
            : "Appointment Management"}
        </h1>
        <p className="text-gray-600 mt-2">
          {userRole === "doctor"
            ? "Manage your patient appointments"
            : "Schedule and manage your appointments"}
        </p>
      </div>
      {userRole === "patient" && (
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onBookNewAppointment}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book New Appointment
        </Button>
      )}
    </div>
  );
};

const AppointmentProgress: React.FC<{ step: AppointmentStep }> = ({ step }) => {
  const steps = [
    { key: "select-doctor" as const, label: "Select Doctor" },
    { key: "select-slot" as const, label: "Choose Time" },
    { key: "confirmation" as const, label: "Confirm" },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((stepItem, index) => (
          <React.Fragment key={stepItem.key}>
            <div
              className={`flex items-center ${
                step === stepItem.key ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === stepItem.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </div>
              <span className="ml-2 font-medium">{stepItem.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
