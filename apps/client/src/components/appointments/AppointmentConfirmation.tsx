import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { AppointmentService } from "../../services/AppointmentService";
import { IDoctor } from "@shared/healthcare-types";
import { Calendar, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";

interface AppointmentConfirmationProps {
  doctor: IDoctor;
  date: Date;
  slot: string;
  onConfirm: () => void;
  onBack: () => void;
}

export const AppointmentConfirmation: React.FC<
  AppointmentConfirmationProps
> = ({ doctor, date, slot, onConfirm, onBack }) => {
  const appointmentService = new AppointmentService();

  const {
    loading,
    error,
    execute: bookAppointment,
  } = useApi(
    async () => {
      const appointmentDateTime = new Date(date);
      const [hours, minutes] = slot.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return appointmentService.createAppointment({
        doctorId: doctor._id,
        dateTime: appointmentDateTime.toISOString(),
        reason: "Regular checkup",
        duration: 30,
        patientId: undefined, // Will be set from auth context in real app
      });
    },
    {
      onSuccess: () => {
        alert("Appointment booked successfully!");
        onConfirm();
      },
    }
  );

  const handleConfirm = async () => {
    try {
      await bookAppointment();
    } catch (err) {
      // Error is handled by useApi
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Appointment Confirmation</CardTitle>
          <CardDescription>
            Please review your appointment details before confirming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <AppointmentDetails doctor={doctor} date={date} slot={slot} />

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AppointmentDetails: React.FC<{
  doctor: IDoctor;
  date: Date;
  slot: string;
}> = ({ doctor, date, slot }) => (
  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
    <DetailRow
      label="Doctor"
      value={`Dr. ${doctor.firstName} ${doctor.lastName}`}
    />
    <DetailRow
      label="Specialization"
      value={doctor.specialization || "General Practitioner"}
    />
    <DetailRow label="Date" value={date.toLocaleDateString()} />
    <DetailRow label="Time" value={slot} />
    <DetailRow label="Duration" value="30 minutes" />
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center">
    <span className="font-semibold">{label}:</span>
    <span>{value}</span>
  </div>
);
