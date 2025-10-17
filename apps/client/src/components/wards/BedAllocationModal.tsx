import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { IBed, IUser } from "@shared/healthcare-types";
import { SearchBar } from "../common/SearchBar";

interface BedAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: IBed | null;
  patients: IUser[];
  onAllocate: (bedId: string, patientId: string) => void;
  loading: boolean;
}

export const BedAllocationModal: React.FC<BedAllocationModalProps> = ({
  isOpen,
  onClose,
  bed,
  patients,
  onAllocate,
  loading,
}) => {
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(patientSearchTerm.toLowerCase()) ||
      patient.nationalId
        .toLowerCase()
        .includes(patientSearchTerm.toLowerCase()) ||
      patient._id?.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatient && bed) {
      onAllocate(bed._id!, selectedPatient._id!);
    } else {
      alert("Please select a patient");
    }
  };

  const handleClose = () => {
    setPatientSearchTerm("");
    setSelectedPatient(null);
    onClose();
  };

  if (!bed) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Allocate Bed ${bed.bedNumber}`}
      description="Assign this bed to a patient"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Patient *
          </label>
          <SearchBar
            value={patientSearchTerm}
            onChange={setPatientSearchTerm}
            placeholder="Enter patient name, ID, or national ID..."
          />
        </div>

        {patientSearchTerm && (
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            <h4 className="font-semibold mb-2">Select Patient:</h4>
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <PatientOption
                  key={patient._id}
                  patient={patient}
                  isSelected={selectedPatient?._id === patient._id}
                  onSelect={setSelectedPatient}
                />
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No patients found
                </p>
              )}
            </div>
          </div>
        )}

        {selectedPatient && <SelectedPatientInfo patient={selectedPatient} />}

        <BedInfo bed={bed} />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedPatient || loading}>
            {loading ? "Allocating..." : "Allocate Bed"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const PatientOption: React.FC<{
  patient: IUser;
  isSelected: boolean;
  onSelect: (patient: IUser) => void;
}> = ({ patient, isSelected, onSelect }) => (
  <div
    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
      isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
    }`}
    onClick={() => onSelect(patient)}
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
);

const SelectedPatientInfo: React.FC<{ patient: IUser }> = ({ patient }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
    <h4 className="font-semibold text-green-800 mb-1">Selected Patient:</h4>
    <p className="text-green-700">
      {patient.firstName} {patient.lastName}
      (ID: {patient._id})
    </p>
  </div>
);

const BedInfo: React.FC<{ bed: IBed }> = ({ bed }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-semibold mb-2">Bed Information</h3>
    <div className="space-y-2 text-sm">
      <DetailRow label="Bed Number" value={bed.bedNumber} />
      <DetailRow label="Ward" value={`${bed.bedType} Ward`} />
      <DetailRow label="Type" value={bed.bedType} />
      <DetailRow label="Status" value="Available" highlight />
    </div>
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div className="flex justify-between">
    <span>{label}:</span>
    <span className={highlight ? "text-green-600 font-medium" : ""}>
      {value}
    </span>
  </div>
);
