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
import { IWard, IBed, BedStatus, WardType } from "@shared/healthcare-types";
import { Bed, Search, Filter, MapPin, User, Loader2 } from "lucide-react";

export const WardManagement: React.FC = () => {
  const [wards, setWards] = useState<IWard[]>([]);
  const [allBeds, setAllBeds] = useState<IBed[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<IWard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState<IBed | null>(null);
  const [loading, setLoading] = useState(false);

  const wardService = new WardService();

  useEffect(() => {
    loadWards();
    loadAllBeds();
  }, []);

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

      // Load all beds by getting beds for each ward
      const allBedsData: IBed[] = [];
      const wardsData = await wardService.getWards();

      for (const ward of wardsData) {
        // In a real app, you'd have an API endpoint to get beds by ward
        // For now, we'll use the available beds and mock some additional data
        const wardBeds = availableData.filter((bed) => bed.wardId === ward._id);
        allBedsData.push(...wardBeds);
      }

      // Add some mock occupied beds for demonstration
      // In a real app, this would come from the API
      const mockBeds: IBed[] = [
        {
          _id: "bed1",
          bedNumber: "ICU-01",
          wardId: wardsData[0]?._id || "ward1",
          bedType: WardType.ICU,
          status: BedStatus.OCCUPIED,
          patientId: "PAT001",
          features: [],
        },
        {
          _id: "bed4",
          bedNumber: "GW-01",
          wardId: wardsData[1]?._id || "ward2",
          bedType: WardType.GENERAL,
          status: BedStatus.OCCUPIED,
          patientId: "PAT002",
          features: [],
        },
        {
          _id: "bed6",
          bedNumber: "GW-03",
          wardId: wardsData[1]?._id || "ward2",
          bedType: WardType.GENERAL,
          status: BedStatus.MAINTENANCE,
          features: [],
        },
      ];

      setAllBeds([...allBedsData, ...mockBeds]);
    } catch (error) {
      console.error("Failed to load beds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateBed = async (bedId: string, patientId: string) => {
    try {
      await wardService.allocateBed(bedId, patientId);
      await loadAllBeds();
      await loadWards();
      setShowAllocationModal(false);
      alert(`Bed allocated successfully to patient ${patientId}`);
    } catch (error: any) {
      console.error("Failed to allocate bed:", error);
      alert(`Failed to allocate bed: ${error.message}`);
    }
  };

  const handleTransferPatient = async (
    currentBedId: string,
    newBedId: string
  ) => {
    try {
      await wardService.transferPatient(currentBedId, newBedId);
      await loadAllBeds();
      await loadWards();
      alert("Patient transferred successfully");
    } catch (error: any) {
      console.error("Failed to transfer patient:", error);
      alert(`Failed to transfer patient: ${error.message}`);
    }
  };

  const handleDischargePatient = async (bedId: string) => {
    try {
      await wardService.dischargePatient(bedId);
      await loadAllBeds();
      await loadWards();
      alert("Patient discharged successfully");
    } catch (error: any) {
      console.error("Failed to discharge patient:", error);
      alert(`Failed to discharge patient: ${error.message}`);
    }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ward & Bed Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage patient bed allocations and ward occupancy
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Bed className="w-4 h-4 mr-2" />
          Add New Ward
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patient by ID, name, or admission number..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  Floor 2, Wing A
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span className="font-semibold">
                      {wardBeds.length} beds
                    </span>
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
                      width: `${(occupiedBeds / wardBeds.length) * 100}%`,
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
                          <div className="flex items-center justify-center text-xs text-gray-600">
                            <User className="w-3 h-3 mr-1" />
                            Patient #{bed.patientId}
                          </div>
                          <div className="flex justify-center space-x-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newBedId = prompt("Enter new bed ID:");
                                if (newBedId) {
                                  handleTransferPatient(bed._id!, newBedId);
                                }
                              }}
                            >
                              Transfer
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
                            >
                              Discharge
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
          onAllocate={handleAllocateBed}
          onClose={() => {
            setShowAllocationModal(false);
            setSelectedBed(null);
          }}
        />
      )}
    </div>
  );
};

// Bed Allocation Modal Component
const BedAllocationModal: React.FC<{
  bed: IBed;
  onAllocate: (bedId: string, patientId: string) => void;
  onClose: () => void;
}> = ({ bed, onAllocate, onClose }) => {
  const [patientId, setPatientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      onAllocate(bed._id!, patientId);
    } else {
      alert("Please enter a patient ID");
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
              Patient ID *
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient ID (e.g., PAT001)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Try: PAT001, PAT002, or any patient ID
            </p>
          </div>

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
            <Button type="submit">Allocate Bed</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
