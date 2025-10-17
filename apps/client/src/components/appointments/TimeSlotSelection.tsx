import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  IDoctor,
  IAppointment,
  AppointmentStatus,
} from "@shared/healthcare-types";
import { Calendar, Clock, User } from "lucide-react";

interface TimeSlotSelectionProps {
  doctor: IDoctor;
  appointments: IAppointment[];
  onSlotSelect: (slot: string, date: Date) => void;
  onBack: () => void;
}

export const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  doctor,
  appointments,
  onSlotSelect,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const generateTimeSlots = (date: Date): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);
        const isBooked = appointments.some(
          (apt) =>
            apt.doctorId === doctor._id &&
            new Date(apt.dateTime).getTime() === slotDateTime.getTime() &&
            apt.status !== AppointmentStatus.CANCELLED
        );

        if (!isBooked) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DoctorSummary doctor={doctor} onBack={onBack} />

      <DateSelection
        dateOptions={dateOptions}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        generateTimeSlots={generateTimeSlots}
      />

      {selectedDate && (
        <TimeSlots
          date={selectedDate}
          timeSlots={generateTimeSlots(selectedDate)}
          onSlotSelect={(slot) => onSlotSelect(slot, selectedDate)}
        />
      )}
    </div>
  );
};

const DoctorSummary: React.FC<{ doctor: IDoctor; onBack: () => void }> = ({
  doctor,
  onBack,
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-gray-600">
              {doctor.specialization || "General Practitioner"}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onBack}>
            Change Doctor
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DateSelection: React.FC<{
  dateOptions: Date[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  generateTimeSlots: (date: Date) => string[];
}> = ({ dateOptions, selectedDate, onDateSelect, generateTimeSlots }) => (
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
          const timeSlots = generateTimeSlots(date);
          const hasAvailableSlots = timeSlots.length > 0;

          return (
            <Button
              key={index}
              variant={
                selectedDate?.toDateString() === date.toDateString()
                  ? "default"
                  : "outline"
              }
              className="h-16 flex-col"
              onClick={() => onDateSelect(date)}
              disabled={!hasAvailableSlots}
            >
              <span className="text-xs">
                {date.toLocaleDateString("en", { weekday: "short" })}
              </span>
              <span className="text-lg font-semibold">{date.getDate()}</span>
              {hasAvailableSlots && (
                <span className="text-xs text-green-500">Available</span>
              )}
            </Button>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const TimeSlots: React.FC<{
  date: Date;
  timeSlots: string[];
  onSlotSelect: (slot: string) => void;
}> = ({ date, timeSlots, onSlotSelect }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Available Time Slots
      </CardTitle>
      <CardDescription>
        {date.toLocaleDateString("en", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot) => (
          <Button
            key={slot}
            variant="outline"
            className="h-12"
            onClick={() => onSlotSelect(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>
      {timeSlots.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No available time slots for this date.
        </p>
      )}
    </CardContent>
  </Card>
);
