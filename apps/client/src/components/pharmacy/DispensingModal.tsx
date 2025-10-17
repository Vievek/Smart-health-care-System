import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { IMedicalRecord, IUser } from "@shared/healthcare-types";
import {
  CheckCircle,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { PharmacyService } from "../../services/PharmacyService";
import { useApi } from "../../hooks/useApi";

interface DispensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: IMedicalRecord | null;
  patient: IUser | null;
  onDispense: (data: any) => Promise<any>;
}

type DispensingStep = "validation" | "preparation" | "completion";

export const DispensingModal: React.FC<DispensingModalProps> = ({
  isOpen,
  onClose,
  prescription,
  patient,
  onDispense,
}) => {
  const [step, setStep] = useState<DispensingStep>("validation");
  const [interactions, setInteractions] = useState<string[]>([]);

  const pharmacyService = new PharmacyService();

  const { execute: checkInteractions, loading: interactionsLoading } = useApi(
    async () => {
      if (!patient || !prescription?.prescription)
        throw new Error("Missing data");
      const medicationNames = prescription.prescription.medications.map(
        (med) => med.name
      );
      const result = await pharmacyService.checkDrugInteractions(
        patient._id!,
        medicationNames
      );
      return result;
    },
    {
      onSuccess: (interactionResults) => {
        setInteractions(interactionResults);
        setStep("preparation");
      },
    }
  );

  const { execute: completeDispensing, loading: dispensingLoading } = useApi(
    async () => {
      if (!prescription?.prescription || !patient) {
        throw new Error("No prescription data available");
      }

      const dispenseData = {
        prescriptionId: prescription._id!,
        patientId: patient._id!,
        pharmacistId: "PHA001", // From auth context in real app
        medications: prescription.prescription.medications.map((med) => ({
          medicationId: med.medicationId,
          name: med.name,
          quantity: 1,
          batchNumber: "BATCH001",
          price: 12.5,
        })),
        paymentMethod: "cash",
      };

      return onDispense(dispenseData);
    },
    {
      onSuccess: () => {
        setStep("completion");
      },
    }
  );

  const handleClose = () => {
    setStep("validation");
    setInteractions([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dispense Medication"
      description="Process prescription fulfillment"
      size="lg"
    >
      <div className="space-y-6">
        <DispensingProgress step={step} />

        {step === "validation" && (
          <ValidationStep
            prescription={prescription}
            patient={patient}
            interactions={interactions}
            loading={interactionsLoading}
            onCheckInteractions={checkInteractions}
            onClose={handleClose}
          />
        )}

        {step === "preparation" && (
          <PreparationStep
            prescription={prescription}
            interactions={interactions}
            loading={dispensingLoading}
            onComplete={completeDispensing}
            onBack={() => setStep("validation")}
          />
        )}

        {step === "completion" && (
          <CompletionStep
            prescription={prescription}
            patient={patient}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
};

const DispensingProgress: React.FC<{ step: DispensingStep }> = ({ step }) => {
  const steps = [
    { key: "validation" as const, label: "Validation" },
    { key: "preparation" as const, label: "Preparation" },
    { key: "completion" as const, label: "Completion" },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((stepItem, index) => (
          <React.Fragment key={stepItem.key}>
            <div
              className={`flex items-center ${
                step === stepItem.key ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === stepItem.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </div>
              <span className="ml-2 font-medium">{stepItem.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ValidationStep: React.FC<{
  prescription: IMedicalRecord | null;
  patient: IUser | null;
  interactions: string[];
  loading: boolean;
  onCheckInteractions: () => void;
  onClose: () => void;
}> = ({
  prescription,
  patient,
  interactions,
  loading,
  onCheckInteractions,
  onClose,
}) => {
  if (!prescription || !patient) return null;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Prescription Validation
        </h3>
        <ValidationDetails prescription={prescription} patient={patient} />
      </div>

      {prescription.prescription && (
        <MedicationsList medications={prescription.prescription.medications} />
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Drug Interactions Check
        </h3>
        <InteractionsList interactions={interactions} />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onCheckInteractions} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const ValidationDetails: React.FC<{
  prescription: IMedicalRecord;
  patient: IUser;
}> = ({ prescription, patient }) => (
  <div className="space-y-2 text-sm">
    <DetailRow
      label="Patient"
      value={`${patient.firstName} ${patient.lastName}`}
    />
    <DetailRow label="Patient ID" value={patient._id!} />
    <DetailRow label="Prescription" value={prescription.title} />
    <DetailRow
      label="Issued Date"
      value={new Date(prescription.createdDate).toLocaleDateString()}
    />
    <DetailRow
      label="Status"
      value={prescription.prescription?.status || "Unknown"}
      highlight
    />
  </div>
);

const MedicationsList: React.FC<{ medications: any[] }> = ({ medications }) => (
  <div className="border rounded-lg p-4">
    <h4 className="font-semibold mb-3">Medications</h4>
    <div className="space-y-2">
      {medications.map((med, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-2 bg-gray-50 rounded"
        >
          <div>
            <span className="font-medium">{med.name}</span>
            <span className="text-sm text-gray-600 ml-2">
              {med.dosage} • {med.frequency} • {med.duration}
            </span>
          </div>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Required
          </span>
        </div>
      ))}
    </div>
  </div>
);

const InteractionsList: React.FC<{ interactions: string[] }> = ({
  interactions,
}) => {
  if (interactions.length === 0) {
    return (
      <p className="text-sm text-yellow-700">
        No interactions checked yet. Click below to check.
      </p>
    );
  }

  return (
    <ul className="text-sm space-y-1">
      {interactions.map((interaction, index) => (
        <li key={index}>• {interaction}</li>
      ))}
    </ul>
  );
};

const PreparationStep: React.FC<{
  prescription: IMedicalRecord | null;
  interactions: string[];
  loading: boolean;
  onComplete: () => void;
  onBack: () => void;
}> = ({ prescription, interactions, loading, onComplete, onBack }) => {
  if (!prescription?.prescription) return null;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-green-900">
            Prescription Validated
          </h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          {interactions.length > 0 &&
          interactions[0] !== "No significant interactions found"
            ? "Interactions found. Please review before dispensing."
            : "No significant interactions found. Ready for dispensing."}
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Medication Preparation</h3>
        <div className="space-y-3">
          {prescription.prescription.medications.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <span className="font-medium">{med.name}</span>
                <span className="text-sm text-gray-600 ml-2">
                  {med.dosage} • {med.frequency}
                </span>
              </div>
              <span className="text-sm text-green-600">In stock</span>
            </div>
          ))}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Pill className="w-4 h-4" />
            <span>Preparing medication for dispensing...</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Dispensing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Complete Dispensing
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<{
  prescription: IMedicalRecord | null;
  patient: IUser | null;
  onClose: () => void;
}> = ({ prescription, patient, onClose }) => (
  <div className="text-center space-y-6">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>

    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Medication Dispensed Successfully
      </h3>
      <p className="text-gray-600">
        The prescription has been fulfilled and inventory updated.
      </p>
    </div>

    <TransactionDetails prescription={prescription} patient={patient} />

    <div className="flex justify-end space-x-3">
      <Button onClick={onClose}>Close</Button>
    </div>
  </div>
);

const TransactionDetails: React.FC<{
  prescription: IMedicalRecord | null;
  patient: IUser | null;
}> = ({ prescription, patient }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-left">
    <h4 className="font-semibold mb-2">Transaction Details</h4>
    <div className="space-y-2 text-sm">
      <DetailRow
        label="Patient"
        value={`${patient?.firstName} ${patient?.lastName}`}
      />
      <DetailRow
        label="Prescription"
        value={prescription?.title || "Unknown"}
      />
      <DetailRow label="Dispensed At" value={new Date().toLocaleString()} />
      <DetailRow label="Transaction ID" value={`TX-${Date.now()}`} />
      <DetailRow label="Amount" value="$12.50" highlight />
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
    <span className={highlight ? "font-semibold" : ""}>{value}</span>
  </div>
);
