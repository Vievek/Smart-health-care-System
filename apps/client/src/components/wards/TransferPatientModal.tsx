import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { IBed } from "@shared/healthcare-types";

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBed: IBed | null;
  availableBeds: IBed[];
  onTransfer: (currentBedId: string, newBedId: string) => void;
  loading: boolean;
}

export const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  currentBed,
  availableBeds,
  onTransfer,
  loading,
}) => {
  const [selectedNewBed, setSelectedNewBed] = useState<IBed | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNewBed && currentBed) {
      onTransfer(currentBed._id!, selectedNewBed._id!);
    } else {
      alert("Please select a new bed");
    }
  };

  const handleClose = () => {
    setSelectedNewBed(null);
    onClose();
  };

  if (!currentBed) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Patient"
      description="Move patient to a different bed"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CurrentBedInfo bed={currentBed} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Bed *
          </label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {availableBeds.map((bed) => (
                <BedOption
                  key={bed._id}
                  bed={bed}
                  isSelected={selectedNewBed?._id === bed._id}
                  onSelect={setSelectedNewBed}
                />
              ))}
              {availableBeds.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No available beds found
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedNewBed && <SelectedBedInfo bed={selectedNewBed} />}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedNewBed || loading}>
            {loading ? "Transferring..." : "Transfer Patient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CurrentBedInfo: React.FC<{ bed: IBed }> = ({ bed }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
    <h4 className="font-semibold text-yellow-800 mb-1">Current Bed:</h4>
    <p className="text-yellow-700">
      Bed {bed.bedNumber} ({bed.bedType} Ward)
    </p>
    {bed.patientId && (
      <p className="text-sm text-yellow-600 mt-1">Patient: {bed.patientId}</p>
    )}
  </div>
);

const BedOption: React.FC<{
  bed: IBed;
  isSelected: boolean;
  onSelect: (bed: IBed) => void;
}> = ({ bed, isSelected, onSelect }) => (
  <div
    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
      isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
    }`}
    onClick={() => onSelect(bed)}
  >
    <div>
      <p className="font-medium">Bed {bed.bedNumber}</p>
      <p className="text-sm text-gray-600">{bed.bedType} Ward</p>
    </div>
    <Button size="sm" variant="outline">
      Select
    </Button>
  </div>
);

const SelectedBedInfo: React.FC<{ bed: IBed }> = ({ bed }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
    <h4 className="font-semibold text-green-800 mb-1">Selected New Bed:</h4>
    <p className="text-green-700">
      Bed {bed.bedNumber} ({bed.bedType} Ward)
    </p>
  </div>
);
