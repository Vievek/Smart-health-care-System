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
  IWard,
  IBed,
  BedStatus,
  WardType,
  IUser,
} from "@shared/healthcare-types";
import { Bed, Filter, Loader2, MapPin } from "lucide-react";
import { SearchBar } from "../common/SearchBar";
import { BedAllocationModal } from "./BedAllocationModal";
import { TransferPatientModal } from "./TransferPatientModal";
import { WardService } from "../../services/WardService";

interface StaffWardViewProps {
  wards: IWard[];
  allBeds: IBed[];
  availableBeds: IBed[];
  selectedWard: IWard | null;
  searchTerm: string;
  patients: IUser[];
  onSelectWard: (ward: IWard) => void;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

export const StaffWardView: React.FC<StaffWardViewProps> = ({
  wards,
  allBeds,
  availableBeds,
  selectedWard,
  searchTerm,
  patients,
  onSelectWard,
  onSearchChange,
  onRefresh,
}) => {
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState<IBed | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const wardService = new WardService();

  const handleAllocateBed = async (bedId: string, patientId: string) => {
    setActionLoading("allocate");
    try {
      await wardService.allocateBed(bedId, patientId);
      await onRefresh();
      setShowAllocationModal(false);
      alert("Bed allocated successfully!");
    } catch (error: any) {
      alert(`Failed to allocate bed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferPatient = async (
    currentBedId: string,
    newBedId: string
  ) => {
    setActionLoading("transfer");
    try {
      await wardService.transferPatient(currentBedId, newBedId);
      await onRefresh();
      setShowTransferModal(false);
      alert("Patient transferred successfully");
    } catch (error: any) {
      alert(`Failed to transfer patient: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDischargePatient = async (bedId: string) => {
    setActionLoading(`discharge-${bedId}`);
    try {
      await wardService.dischargePatient(bedId);
      await onRefresh();
      alert("Patient discharged successfully");
    } catch (error: any) {
      alert(`Failed to discharge patient: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getBedsForWard = (wardId: string) => {
    return allBeds.filter((bed) => bed.wardId === wardId);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient ${patientId}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header />

      <SearchAndStats
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        availableBedsCount={availableBeds.length}
      />

      <WardsGrid
        wards={wards}
        selectedWard={selectedWard}
        onSelectWard={onSelectWard}
        getBedsForWard={getBedsForWard}
      />

      {selectedWard && (
        <BedManagement
          ward={selectedWard}
          beds={getBedsForWard(selectedWard._id!)}
          getPatientName={getPatientName}
          onRefresh={onRefresh}
          onAllocateBed={(bed) => {
            setSelectedBed(bed);
            setShowAllocationModal(true);
          }}
          onTransferPatient={(bed) => {
            setSelectedBed(bed);
            setShowTransferModal(true);
          }}
          onDischargePatient={handleDischargePatient}
          actionLoading={actionLoading}
        />
      )}

      <BedAllocationModal
        isOpen={showAllocationModal}
        onClose={() => {
          setShowAllocationModal(false);
          setSelectedBed(null);
        }}
        bed={selectedBed}
        patients={patients}
        onAllocate={handleAllocateBed}
        loading={actionLoading === "allocate"}
      />

      <TransferPatientModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedBed(null);
        }}
        currentBed={selectedBed}
        availableBeds={availableBeds.filter(
          (bed) => bed._id !== selectedBed?._id
        )}
        onTransfer={handleTransferPatient}
        loading={actionLoading === "transfer"}
      />
    </div>
  );
};

const Header: React.FC = () => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Ward & Bed Management
      </h1>
      <p className="text-gray-600 mt-2">
        Manage patient bed allocations and ward occupancy
      </p>
    </div>
  </div>
);

const SearchAndStats: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableBedsCount: number;
}> = ({ searchTerm, onSearchChange, availableBedsCount }) => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <Card className="lg:col-span-3">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search beds by number or patient..."
            className="flex-1"
          />
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
            <p className="text-sm font-medium text-blue-800">Available Beds</p>
            <p className="text-2xl font-bold text-blue-900">
              {availableBedsCount}
            </p>
          </div>
          <Bed className="w-8 h-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const WardsGrid: React.FC<{
  wards: IWard[];
  selectedWard: IWard | null;
  onSelectWard: (ward: IWard) => void;
  getBedsForWard: (wardId: string) => IBed[];
}> = ({ wards, selectedWard, onSelectWard, getBedsForWard }) => (
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
        <WardCard
          key={ward._id}
          ward={ward}
          isSelected={selectedWard?._id === ward._id}
          occupiedBeds={occupiedBeds}
          availableBeds={availableBedsCount}
          onSelect={onSelectWard}
        />
      );
    })}
  </div>
);

const WardCard: React.FC<{
  ward: IWard;
  isSelected: boolean;
  occupiedBeds: number;
  availableBeds: number;
  onSelect: (ward: IWard) => void;
}> = ({ ward, isSelected, occupiedBeds, availableBeds, onSelect }) => {
  const getWardTypeColor = (type: WardType) => {
    switch (type) {
      case WardType.ICU:
        return "bg-red-100 text-red-800";
      case WardType.GENERAL:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() => onSelect(ward)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{ward.name}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getWardTypeColor(
              ward.type
            )}`}
          >
            {ward.type.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {occupiedBeds} occupied, {availableBeds} available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WardStats
          capacity={ward.capacity}
          occupiedBeds={occupiedBeds}
          availableBeds={availableBeds}
        />
      </CardContent>
    </Card>
  );
};

const WardStats: React.FC<{
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
}> = ({ capacity, occupiedBeds, availableBeds }) => (
  <>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Capacity:</span>
        <span className="font-semibold">{capacity} beds</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Occupied:</span>
        <span className="font-semibold text-red-600">{occupiedBeds}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Available:</span>
        <span className="font-semibold text-green-600">{availableBeds}</span>
      </div>
    </div>
    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${(occupiedBeds / capacity) * 100}%` }}
      ></div>
    </div>
  </>
);

const BedManagement: React.FC<{
  ward: IWard;
  beds: IBed[];
  getPatientName: (patientId: string) => string;
  onRefresh: () => void;
  onAllocateBed: (bed: IBed) => void;
  onTransferPatient: (bed: IBed) => void;
  onDischargePatient: (bedId: string) => void;
  actionLoading: string | null;
}> = ({
  ward,
  beds,
  getPatientName,
  onRefresh,
  onAllocateBed,
  onTransferPatient,
  onDischargePatient,
  actionLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            {ward.name} - Bed Management
            <span className="ml-4 text-sm font-normal text-gray-600">
              ({beds.length} beds)
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {beds.map((bed) => (
            <BedCard
              key={bed._id}
              bed={bed}
              getPatientName={getPatientName}
              onAllocate={onAllocateBed}
              onTransfer={onTransferPatient}
              onDischarge={onDischargePatient}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const BedCard: React.FC<{
  bed: IBed;
  getPatientName: (patientId: string) => string;
  onAllocate: (bed: IBed) => void;
  onTransfer: (bed: IBed) => void;
  onDischarge: (bedId: string) => void;
  actionLoading: string | null;
}> = ({
  bed,
  getPatientName,
  onAllocate,
  onTransfer,
  onDischarge,
  actionLoading,
}) => {
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

  const getStatusText = (status: BedStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card
      className={`text-center cursor-pointer hover:shadow-md transition-shadow border-2 ${getBedStatusColor(
        bed.status
      )}`}
      onClick={() => {
        if (bed.status === BedStatus.AVAILABLE) {
          onAllocate(bed);
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
          {getStatusText(bed.status)}
        </p>
        {bed.patientId && (
          <div className="mt-2">
            <div className="flex items-center justify-center text-xs text-gray-600 mb-2">
              {getPatientName(bed.patientId)}
            </div>
            <div className="flex justify-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onTransfer(bed);
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
                    onDischarge(bed._id!);
                  }
                }}
                disabled={actionLoading === `discharge-${bed._id}`}
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
  );
};
