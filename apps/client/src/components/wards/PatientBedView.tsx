import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IWard, IBed } from "@shared/healthcare-types";
import { Bed } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface PatientBedViewProps {
  patientBeds: IBed[];
  wards: IWard[];
}

export const PatientBedView: React.FC<PatientBedViewProps> = ({
  patientBeds,
  wards,
}) => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Bed Information
          </h1>
          <p className="text-gray-600 mt-2">View your current bed assignment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            My Bed Allocation
          </CardTitle>
          <CardDescription>
            View your current bed assignment and ward information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientBeds.length === 0 ? (
            <EmptyBedAssignment />
          ) : (
            <BedAssignmentList
              patientBeds={patientBeds}
              wards={wards}
              user={user}
            />
          )}
        </CardContent>
      </Card>

      <WardOverview wards={wards} />
    </div>
  );
};

const EmptyBedAssignment: React.FC = () => (
  <div className="text-center py-8">
    <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">No bed allocation found.</p>
    <p className="text-sm text-gray-400 mt-2">
      Please contact hospital staff for bed assignment.
    </p>
  </div>
);

const BedAssignmentList: React.FC<{
  patientBeds: IBed[];
  wards: IWard[];
  user: any;
}> = ({ patientBeds, wards, user }) => (
  <div className="space-y-4">
    {patientBeds.map((bed) => {
      const ward = wards.find((w) => w._id === bed.wardId);
      return (
        <Card key={bed._id} className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bed {bed.bedNumber}</h3>
                  <p className="text-blue-600">
                    {ward?.name} • {bed.bedType}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="text-green-600 font-medium">Occupied</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

const WardOverview: React.FC<{ wards: IWard[] }> = ({ wards }) => (
  <Card>
    <CardHeader>
      <CardTitle>Hospital Wards Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wards.map((ward) => {
          const availableBedsCount = Math.floor(Math.random() * ward.capacity); // Mock data
          return (
            <Card key={ward._id} className="text-center p-4">
              <h4 className="font-semibold">{ward.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{ward.type}</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-blue-600">
                  {availableBedsCount}
                </p>
                <p className="text-xs text-gray-500">Available Beds</p>
              </div>
            </Card>
          );
        })}
      </div>
    </CardContent>
  </Card>
);
