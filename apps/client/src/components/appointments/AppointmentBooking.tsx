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
import { IDoctor, UserRole, UserStatus } from "@shared/healthcare-types";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Search,
  Filter,
} from "lucide-react";

export const AppointmentBooking: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<
    "select-doctor" | "select-slot" | "confirmation"
  >("select-doctor");

  const appointmentService = new AppointmentService();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      // In a real app, this would be an API call to get doctors
      // For now, using mock data but structured as if it were from API
      const mockDoctors: IDoctor[] = [
        {
          _id: "1",
          nationalId: "doc123",
          email: "dr.smith@hospital.com",
          phone: "+1234567890",
          firstName: "John",
          lastName: "Smith",
          role: UserRole.DOCTOR,
          status: UserStatus.ACTIVE,
          passwordHash: "",
          address: "123 Medical Center",
          specialization: "Cardiology",
          licenseNumber: "MED12345",
          schedule: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    }
  };

  const handleDoctorSelect = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setStep("select-slot");
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep("confirmation");
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;

    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      await appointmentService.createAppointment({
        doctorId: selectedDoctor._id,
        dateTime: appointmentDateTime.toISOString(),
        reason: "Regular checkup",
        duration: 30,
      });

      // Show success message and reset
      setStep("select-doctor");
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Failed to book appointment:", error);
    }
  };

  // Generate time slots
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - From Storyboard */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-2">
          Schedule your visit with our healthcare professionals
        </p>
      </div>

      {/* Booking Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center ${
              step === "select-doctor" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "select-doctor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Select Doctor</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div
            className={`flex items-center ${
              step === "select-slot" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "select-slot"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Choose Time</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div
            className={`flex items-center ${
              step === "confirmation" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "confirmation"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === "select-doctor" && (
        <div className="space-y-6">
          {/* Search and Filter - From Storyboard */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctors Grid - From Storyboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
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
                        {doctor.specialization}
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
                      {selectedDoctor.specialization}
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
                {[...Array(7)].map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  return (
                    <Button
                      key={index}
                      variant={
                        selectedDate?.toDateString() === date.toDateString()
                          ? "default"
                          : "outline"
                      }
                      className="h-16 flex-col"
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="text-xs">
                        {date.toLocaleDateString("en", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-semibold">
                        {date.getDate()}
                      </span>
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
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
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
                    <span>{selectedDoctor.specialization}</span>
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
                  <Button className="flex-1" onClick={handleBookAppointment}>
                    Confirm Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};
