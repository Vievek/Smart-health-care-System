import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  IAppointment,
  AppointmentStatus,
  IUser,
  UserRole,
} from "@shared/healthcare-types";
import { Calendar, User, X } from "lucide-react";
import { AppointmentService } from "../../services/AppointmentService";
import { UserService } from "../../services/UserService";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";

interface AppointmentListProps {
  appointments: IAppointment[];
  onBookNewAppointment: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onBookNewAppointment,
}) => {
  const { user } = useAuth();
  const appointmentService = new AppointmentService();
  const userService = new UserService();

  const [doctors, setDoctors] = useState<IUser[]>([]);
  const [patients, setPatients] = useState<IUser[]>([]);

  // Load all doctors and patients for name resolution
  const { execute: loadDoctors } = useApi(
    () => userService.getUsersByRole(UserRole.DOCTOR),
    {
      onSuccess: (data) => setDoctors(data),
    }
  );

  const { execute: loadPatients } = useApi(
    () => userService.getUsersByRole(UserRole.PATIENT),
    {
      onSuccess: (data) => setPatients(data),
    }
  );

  const { execute: cancelAppointment } = useApi(
    (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId),
    {
      onSuccess: () => {
        alert("Appointment cancelled successfully!");
        window.location.reload(); // Refresh to show updated list
      },
    }
  );

  useEffect(() => {
    loadDoctors();
    loadPatients();
  }, []);

  // FIXED: Proper user ID filtering like in original code
  const userAppointments = appointments.filter((apt) => {
    if (user?.role === UserRole.PATIENT) {
      return apt.patientId === user._id;
    } else if (user?.role === UserRole.DOCTOR) {
      return apt.doctorId === user._id;
    }
    return true;
  });

  // FIXED: Get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    return doctor
      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
      : `Dr. ${doctorId}`;
  };

  // FIXED: Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient ${patientId}`;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await cancelAppointment(appointmentId);
    } catch (err) {
      // Error is handled by useApi
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {user?.role === UserRole.DOCTOR
              ? "Your Appointments"
              : "My Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userAppointments.length === 0 ? (
            <EmptyAppointments
              userRole={user?.role}
              onBookNewAppointment={onBookNewAppointment}
            />
          ) : (
            <AppointmentsGrid
              appointments={userAppointments}
              userRole={user?.role}
              getDoctorName={getDoctorName}
              getPatientName={getPatientName}
              onCancelAppointment={handleCancelAppointment}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyAppointments: React.FC<{
  userRole?: UserRole;
  onBookNewAppointment: () => void;
}> = ({ userRole, onBookNewAppointment }) => (
  <div className="text-center py-8">
    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">
      {userRole === UserRole.DOCTOR
        ? "No appointments scheduled yet."
        : "You have no appointments. Book your first appointment!"}
    </p>
    {userRole === UserRole.PATIENT && (
      <Button className="mt-4" onClick={onBookNewAppointment}>
        Book Appointment
      </Button>
    )}
  </div>
);

const AppointmentsGrid: React.FC<{
  appointments: IAppointment[];
  userRole?: UserRole;
  getDoctorName: (doctorId: string) => string;
  getPatientName: (patientId: string) => string;
  onCancelAppointment: (appointmentId: string) => void;
}> = ({
  appointments,
  userRole,
  getDoctorName,
  getPatientName,
  onCancelAppointment,
}) => (
  <div className="space-y-4">
    {appointments.map((appointment) => (
      <AppointmentCard
        key={appointment._id}
        appointment={appointment}
        userRole={userRole}
        getDoctorName={getDoctorName}
        getPatientName={getPatientName}
        onCancel={() => onCancelAppointment(appointment._id!)}
      />
    ))}
  </div>
);

const AppointmentCard: React.FC<{
  appointment: IAppointment;
  userRole?: UserRole;
  getDoctorName: (doctorId: string) => string;
  getPatientName: (patientId: string) => string;
  onCancel: () => void;
}> = ({ appointment, userRole, getDoctorName, getPatientName, onCancel }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold">
            {userRole === UserRole.DOCTOR
              ? `Patient: ${getPatientName(appointment.patientId)}`
              : getDoctorName(appointment.doctorId)}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(appointment.dateTime).toLocaleString()} •{" "}
            {appointment.reason}
          </p>
          <StatusBadge status={appointment.status} />
        </div>
      </div>
      <div className="flex space-x-2">
        {userRole === UserRole.PATIENT &&
          appointment.status !== AppointmentStatus.CANCELLED && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
      </div>
    </div>
  </Card>
);

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const getStatusConfig = (status: AppointmentStatus) => {
    const statusConfig = {
      [AppointmentStatus.CONFIRMED]: {
        color: "bg-green-100 text-green-800",
        text: "Confirmed",
      },
      [AppointmentStatus.PENDING]: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      [AppointmentStatus.CANCELLED]: {
        color: "bg-red-100 text-red-800",
        text: "Cancelled",
      },
      [AppointmentStatus.COMPLETED]: {
        color: "bg-blue-100 text-blue-800",
        text: "Completed",
      },
      [AppointmentStatus.RESCHEDULED]: {
        color: "bg-purple-100 text-purple-800",
        text: "Rescheduled",
      },
    };

    return (
      statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        text: status,
      }
    );
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};
