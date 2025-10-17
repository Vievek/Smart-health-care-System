import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { WardService } from "../../services/WardService";
import { UserService } from "../../services/UserService";
import {
  IWard,
  IBed,
  BedStatus,
  WardType,
  UserRole,
  IUser,
} from "@shared/healthcare-types";
import { Bed, Search, Filter, MapPin, User, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const WardManagement: React.FC = () => {
  const [wards, setWards] = useState<IWard[]>([]);
  const [allBeds, setAllBeds] = useState<IBed[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<IWard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState<IBed | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientBeds, setPatientBeds] = useState<IBed[]>([]);
  const [patients, setPatients] = useState<IUser[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { user } = useAuth();
  const wardService = new WardService();
  const userService = new UserService();

  useEffect(() => {
    loadWards();
    loadAllBeds();
    loadPatients();
    if (user?.role === UserRole.PATIENT) {
      loadPatientBeds();
    }
  }, [user]);

  const loadWards = async () => {
    try {
      const data = await wardService.getWards();
      setWards(data);
      if (data.length > 0 && !selectedWard) {
        setSelectedWard(data[0]);
      }
    } catch (error) {
      console.error("Failed to load wards:", error);
    }
  };

  const loadAllBeds = async () => {
    try {
      setLoading(true);
      const availableData = await wardService.getAvailableBeds();
      setAvailableBeds(availableData);

      const allBedsData = await wardService.getAllBeds();
      setAllBeds(allBedsData);
    } catch (error) {
      console.error("Failed to load beds:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const allUsers = await userService.getAll();
      const patientUsers = allUsers.filter((u) => u.role === UserRole.PATIENT);
      setPatients(patientUsers);
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const loadPatientBeds = async () => {
    try {
      if (user?._id) {
        const beds = await wardService.getBedsByPatient(user._id);
        setPatientBeds(beds);
      }
    } catch (error) {
      console.error("Failed to load patient beds:", error);
    }
  };

  const handleAllocateBed = async (bedId: string, patientId: string) => {
    try {
      setActionLoading("allocate");
      await wardService.allocateBed(bedId, patientId);
      await loadAllBeds();
      await loadWards();
      setShowAllocationModal(false);
      setSelectedPatient(null);
      setPatientSearchTerm("");
      alert(`Bed allocated successfully!`);
    } catch (error: any) {
      console.error("Failed to allocate bed:", error);
      alert(`Failed to allocate bed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferPatient = async (
    currentBedId: string,
    newBedId: string
  ) => {
    try {
      setActionLoading("transfer");
      await wardService.transferPatient(currentBedId, newBedId);
      await loadAllBeds();
      await loadWards();
      setShowTransferModal(false);
      alert("Patient transferred successfully");
    } catch (error: any) {
      console.error("Failed to transfer patient:", error);
      alert(`Failed to transfer patient: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDischargePatient = async (bedId: string) => {
    try {
      setActionLoading(`discharge-${bedId}`);
      await wardService.dischargePatient(bedId);
      await loadAllBeds();
      await loadWards();
      alert("Patient discharged successfully");
    } catch (error: any) {
      console.error("Failed to discharge patient:", error);
      alert(`Failed to discharge patient: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient ${patientId}`;
  };

  const getBedsForWard = (wardId: string) => {
    return allBeds.filter((bed) => bed.wardId === wardId);
  };

  const getBedStatusColor = (status: BedStatus) => {
    switch (status) {
      case BedStatus.AVAILABLE:
        return "bg-green-100 text-green-600 border-green-200";
      case BedStatus.OCCUPIED:
        return "bg-red-100 text-red-600 border-red-200";
      case BedStatus.MAINTENANCE:
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getBedStatusText = (status: BedStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName
        .toLowerCase()
        .includes(patientSearchTerm.toLowerCase()) ||
      patient.lastName
        .toLowerCase()
        .includes(patientSearchTerm.toLowerCase()) ||
      patient.nationalId
        .toLowerCase()
        .includes(patientSearchTerm.toLowerCase()) ||
      patient._id?.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const availableBedsForTransfer = allBeds.filter(
    (bed) => bed.status === BedStatus.AVAILABLE && bed._id !== selectedBed?._id
  );

  // Patient View Component
  const PatientBedView = () => (
    <div className="space-y-6">
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
            <div className="text-center py-8">
              <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bed allocation found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact hospital staff for bed assignment.
              </p>
            </div>
          ) : (
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
                            <h3 className="font-semibold text-lg">
                              Bed {bed.bedNumber}
                            </h3>
                            <p className="text-blue-600">
                              {ward?.name} • {bed.bedType}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status:{" "}
                              <span className="text-green-600 font-medium">
                                Occupied
                              </span>
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
          )}
        </CardContent>
      </Card>

      {/* Ward Overview for Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Wards Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wards.map((ward) => {
              const wardBeds = getBedsForWard(ward._id!);
              const availableBedsCount = wardBeds.filter(
                (bed) => bed.status === BedStatus.AVAILABLE
              ).length;

              return (
                <Card key={ward._id} className="text-center p-4">
                  <h4 className="font-semibold">{ward.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {ward.type}
                  </p>
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
    </div>
  );

  // Staff View Component
  const StaffWardView = () => (
    <>
      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search beds by number or patient..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Available Beds
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {availableBeds.length}
                </p>
              </div>
              <Bed className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward) => {
          const wardBeds = getBedsForWard(ward._id!);
          const occupiedBeds = wardBeds.filter(
            (bed) => bed.status === BedStatus.OCCUPIED
          ).length;
          const availableBedsCount = wardBeds.filter(
            (bed) => bed.status === BedStatus.AVAILABLE
          ).length;

          return (
            <Card
              key={ward._id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                selectedWard?._id === ward._id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedWard(ward)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{ward.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ward.type === WardType.ICU
                        ? "bg-red-100 text-red-800"
                        : ward.type === WardType.GENERAL
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ward.type.toUpperCase()}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {occupiedBeds} occupied, {availableBedsCount} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span className="font-semibold">{ward.capacity} beds</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Occupied:</span>
                    <span className="font-semibold text-red-600">
                      {occupiedBeds}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-semibold text-green-600">
                      {availableBedsCount}
                    </span>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(occupiedBeds / ward.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bed Management */}
      {selectedWard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bed className="w-5 h-5 mr-2" />
                {selectedWard.name} - Bed Management
                <span className="ml-4 text-sm font-normal text-gray-600">
                  ({getBedsForWard(selectedWard._id!).length} beds)
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadAllBeds()}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span>Loading beds...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {getBedsForWard(selectedWard._id!).map((bed) => (
                  <Card
                    key={bed._id}
                    className={`text-center cursor-pointer hover:shadow-md transition-shadow border-2 ${getBedStatusColor(
                      bed.status
                    )}`}
                    onClick={() => {
                      setSelectedBed(bed);
                      if (bed.status === BedStatus.AVAILABLE) {
                        setShowAllocationModal(true);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                          bed.status === BedStatus.AVAILABLE
                            ? "bg-green-100 text-green-600"
                            : bed.status === BedStatus.OCCUPIED
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        <Bed className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold">Bed {bed.bedNumber}</h3>
                      <p
                        className={`text-xs font-medium mt-1 ${
                          bed.status === BedStatus.AVAILABLE
                            ? "text-green-600"
                            : bed.status === BedStatus.OCCUPIED
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {getBedStatusText(bed.status)}
                      </p>
                      {bed.patientId && (
                        <div className="mt-2">
                          <div className="flex items-center justify-center text-xs text-gray-600 mb-2">
                            <User className="w-3 h-3 mr-1" />
                            {getPatientName(bed.patientId)}
                          </div>
                          <div className="flex justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBed(bed);
                                setShowTransferModal(true);
                              }}
                              disabled={actionLoading === "transfer"}
                            >
                              {actionLoading === "transfer" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Transfer"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 bg-green-100 text-green-700 border-green-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Discharge this patient?")) {
                                  handleDischargePatient(bed._id!);
                                }
                              }}
                              disabled={
                                actionLoading === `discharge-${bed._id}`
                              }
                            >
                              {actionLoading === `discharge-${bed._id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Discharge"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bed Allocation Modal */}
      {showAllocationModal && selectedBed && (
        <BedAllocationModal
          bed={selectedBed}
          patients={filteredPatients}
          patientSearchTerm={patientSearchTerm}
          onPatientSearchChange={setPatientSearchTerm}
          onSelectPatient={setSelectedPatient}
          selectedPatient={selectedPatient}
          onAllocate={handleAllocateBed}
          onClose={() => {
            setShowAllocationModal(false);
            setSelectedBed(null);
            setSelectedPatient(null);
            setPatientSearchTerm("");
          }}
          loading={actionLoading === "allocate"}
        />
      )}

      {/* Transfer Patient Modal */}
      {showTransferModal && selectedBed && (
        <TransferPatientModal
          currentBed={selectedBed}
          availableBeds={availableBedsForTransfer}
          onTransfer={handleTransferPatient}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedBed(null);
          }}
          loading={actionLoading === "transfer"}
        />
      )}
    </>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === UserRole.PATIENT
              ? "My Bed Information"
              : "Ward & Bed Management"}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === UserRole.PATIENT
              ? "View your current bed assignment"
              : "Manage patient bed allocations and ward occupancy"}
          </p>
        </div>
      </div>

      {user?.role === UserRole.PATIENT ? <PatientBedView /> : <StaffWardView />}
    </div>
  );
};

// Bed Allocation Modal Component
const BedAllocationModal: React.FC<{
  bed: IBed;
  patients: IUser[];
  patientSearchTerm: string;
  onPatientSearchChange: (term: string) => void;
  onSelectPatient: (patient: IUser) => void;
  selectedPatient: IUser | null;
  onAllocate: (bedId: string, patientId: string) => void;
  onClose: () => void;
  loading: boolean;
}> = ({
  bed,
  patients,
  patientSearchTerm,
  onPatientSearchChange,
  onSelectPatient,
  selectedPatient,
  onAllocate,
  onClose,
  loading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatient) {
      onAllocate(bed._id!, selectedPatient._id!);
    } else {
      alert("Please select a patient");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Allocate Bed {bed.bedNumber}</h2>
          <p className="text-gray-600 mt-1">Assign this bed to a patient</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Patient *
            </label>
            <input
              type="text"
              value={patientSearchTerm}
              onChange={(e) => onPatientSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient name, ID, or national ID..."
            />
          </div>

          {patientSearchTerm && (
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
              <h4 className="font-semibold mb-2">Select Patient:</h4>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selectedPatient?._id === patient._id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectPatient(patient)}
                  >
                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {patient._id} | National ID: {patient.nationalId}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                ))}
                {patients.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No patients found
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedPatient && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-800 mb-1">
                Selected Patient:
              </h4>
              <p className="text-green-700">
                {selectedPatient.firstName} {selectedPatient.lastName}
                (ID: {selectedPatient._id})
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Bed Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bed Number:</span>
                <span className="font-medium">{bed.bedNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Ward:</span>
                <span className="capitalize">{bed.bedType} Ward</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{bed.bedType}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedPatient || loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Allocating...
                </>
              ) : (
                "Allocate Bed"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transfer Patient Modal Component
const TransferPatientModal: React.FC<{
  currentBed: IBed;
  availableBeds: IBed[];
  onTransfer: (currentBedId: string, newBedId: string) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ currentBed, availableBeds, onTransfer, onClose, loading }) => {
  const [selectedNewBed, setSelectedNewBed] = useState<IBed | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNewBed) {
      onTransfer(currentBed._id!, selectedNewBed._id!);
    } else {
      alert("Please select a new bed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Transfer Patient</h2>
          <p className="text-gray-600 mt-1">Move patient to a different bed</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-800 mb-1">Current Bed:</h4>
            <p className="text-yellow-700">
              Bed {currentBed.bedNumber} ({currentBed.bedType} Ward)
            </p>
            {currentBed.patientId && (
              <p className="text-sm text-yellow-600 mt-1">
                Patient: {currentBed.patientId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Bed *
            </label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {availableBeds.map((bed) => (
                  <div
                    key={bed._id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selectedNewBed?._id === bed._id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedNewBed(bed)}
                  >
                    <div>
                      <p className="font-medium">Bed {bed.bedNumber}</p>
                      <p className="text-sm text-gray-600">
                        {bed.bedType} Ward
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                ))}
                {availableBeds.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No available beds found
                  </p>
                )}
              </div>
            </div>
          </div>

          {selectedNewBed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-800 mb-1">
                Selected New Bed:
              </h4>
              <p className="text-green-700">
                Bed {selectedNewBed.bedNumber} ({selectedNewBed.bedType} Ward)
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedNewBed || loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer Patient"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
