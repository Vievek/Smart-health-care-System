import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { AppointmentService } from "../../services/AppointmentService";
import {
  IDoctor,
  UserRole,
  UserStatus,
  IAppointment,
  AppointmentStatus,
} from "@shared/healthcare-types";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";

export const AppointmentBooking: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [step, setStep] = useState<
    "select-doctor" | "select-slot" | "confirmation"
  >("select-doctor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");

  const { user } = useAuth();
  const appointmentService = new AppointmentService();

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Fetch doctors from API
      const apiService = new (
        await import("../../core/services/ApiService")
      ).ApiService("http://localhost:5000/api");

      // Get all users and filter doctors
      const allUsers = await apiService.get<any[]>("/users");
      const doctorUsers = allUsers.filter(
        (u) => u.role === UserRole.DOCTOR && u.status === UserStatus.ACTIVE
      );

      setDoctors(doctorUsers);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    }
  };

  const handleDoctorSelect = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep("select-slot");
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep("confirmation");
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;

    try {
      setLoading(true);
      setError("");

      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check if slot is already booked
      const isSlotBooked = appointments.some(
        (apt) =>
          apt.doctorId === selectedDoctor._id &&
          new Date(apt.dateTime).getTime() === appointmentDateTime.getTime() &&
          apt.status !== AppointmentStatus.CANCELLED
      );

      if (isSlotBooked) {
        setError(
          "This time slot is already booked. Please choose another time."
        );
        return;
      }

      await appointmentService.createAppointment({
        doctorId: selectedDoctor._id,
        dateTime: appointmentDateTime.toISOString(),
        reason: "Regular checkup",
        duration: 30,
        patientId: user?._id,
      });

      // Show success message and reset
      setStep("select-doctor");
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      setError("");

      // Reload appointments
      await loadAppointments();

      alert("Appointment booked successfully!");
    } catch (error: any) {
      console.error("Failed to book appointment:", error);
      setError(
        error.response?.data?.error ||
          "Failed to book appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots based on doctor's schedule
  const generateTimeSlots = (doctor: IDoctor, date: Date): string[] => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const schedule = doctor.schedule?.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isAvailable
    );

    if (!schedule) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

      // Check if this slot is already booked
      const slotDateTime = new Date(date);
      slotDateTime.setHours(currentHour, currentMinute, 0, 0);
      const isBooked = appointments.some(
        (apt) =>
          apt.doctorId === doctor._id &&
          new Date(apt.dateTime).getTime() === slotDateTime.getTime() &&
          apt.status !== AppointmentStatus.CANCELLED
      );

      if (!isBooked) {
        slots.push(timeString);
      }

      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  };

  // Filter doctors based on search and filter
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      !specializationFilter || doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations for filter
  const specializations = [
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  // Generate next 7 days for date selection
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span>Loading doctors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-2">
          Schedule your visit with our healthcare professionals
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Booking Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {["Select Doctor", "Choose Time", "Confirm"].map(
            (stepName, index) => (
              <React.Fragment key={stepName}>
                <div
                  className={`flex items-center ${
                    (index === 0 && step === "select-doctor") ||
                    (index === 1 && step === "select-slot") ||
                    (index === 2 && step === "confirmation")
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      (index === 0 && step === "select-doctor") ||
                      (index === 1 && step === "select-slot") ||
                      (index === 2 && step === "confirmation")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2 font-medium">{stepName}</span>
                </div>
                {index < 2 && <div className="w-12 h-0.5 bg-gray-300"></div>}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === "select-doctor" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Doctors Grid */}
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
                <Card
                  key={doctor._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleDoctorSelect(doctor)}
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
                        <CardDescription className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          {doctor.specialization || "General Practitioner"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {doctor.address}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Available Today
                      </div>
                    </div>
                    <Button className="w-full mt-4">Select Doctor</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Time Slot */}
      {step === "select-slot" && selectedDoctor && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Doctor Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {selectedDoctor.specialization || "General Practitioner"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setStep("select-doctor")}
                >
                  Change Doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {dateOptions.map((date, index) => {
                  const timeSlots = generateTimeSlots(selectedDoctor, date);
                  const hasAvailableSlots = timeSlots.length > 0;

                  return (
                    <Button
                      key={index}
                      variant={
                        selectedDate?.toDateString() === date.toDateString()
                          ? "default"
                          : "outline"
                      }
                      disabled={!hasAvailableSlots}
                      className="h-16 flex-col"
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="text-xs">
                        {date.toLocaleDateString("en", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-semibold">
                        {date.getDate()}
                      </span>
                      {!hasAvailableSlots && (
                        <span className="text-xs text-red-500">
                          Unavailable
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Available Time Slots
                </CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString("en", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {generateTimeSlots(selectedDoctor, selectedDate).map(
                    (slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        className="h-12"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot}
                      </Button>
                    )
                  )}
                </div>
                {generateTimeSlots(selectedDoctor, selectedDate).length ===
                  0 && (
                  <p className="text-center text-gray-500 py-4">
                    No available time slots for this date.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirmation" &&
        selectedDoctor &&
        selectedDate &&
        selectedSlot && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">
                  Appointment Confirmation
                </CardTitle>
                <CardDescription>
                  Please review your appointment details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Appointment Details */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Doctor:</span>
                    <span>
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Specialization:</span>
                    <span>
                      {selectedDoctor.specialization || "General Practitioner"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Date:</span>
                    <span>{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Time:</span>
                    <span>{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Duration:</span>
                    <span>30 minutes</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("select-slot")}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBookAppointment}
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
        )}
    </div>
  );
};
