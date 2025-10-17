import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { IMedicalRecord } from "@shared/healthcare-types";
import { Download } from "lucide-react";
import { MedicalRecordService } from "../../services/MedicalRecordService";
import { useApi } from "../../hooks/useApi";

interface RecordDetailModalProps {
  record: IMedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const medicalRecordService = new MedicalRecordService();

  const { execute: downloadPDF } = useApi(
    () =>
      record
        ? medicalRecordService.downloadRecordPDF(record._id!)
        : Promise.reject("No record"),
    {
      onSuccess: (blob) => {
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `medical-record-${record?._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
    }
  );

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={record.title} size="xl">
      <div className="space-y-6">
        <RecordDetails record={record} />

        {record.prescription && (
          <PrescriptionDetails prescription={record.prescription} />
        )}

        {record.labResults && <LabResults labResults={record.labResults} />}

        {record.visitDetails && (
          <VisitDetails visitDetails={record.visitDetails} />
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => downloadPDF()}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const RecordDetails: React.FC<{ record: IMedicalRecord }> = ({ record }) => (
  <div className="grid grid-cols-2 gap-4">
    <DetailItem label="Record Type" value={record.recordType} capitalize />
    <DetailItem
      label="Created Date"
      value={new Date(record.createdDate).toLocaleDateString()}
    />
    <DetailItem label="Patient ID" value={record.patientId} />
    <DetailItem label="Author ID" value={record.authorId} />
  </div>
);

const PrescriptionDetails: React.FC<{ prescription: any }> = ({
  prescription,
}) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold mb-3 text-lg">Prescription Details</h3>
    <div className="space-y-3">
      {prescription.medications.map((med: any, index: number) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 bg-gray-50 rounded"
        >
          <div>
            <span className="font-medium">{med.name}</span>
            <span className="text-sm text-gray-600 ml-2">
              {med.dosage} • {med.frequency}
            </span>
          </div>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {med.duration}
          </span>
        </div>
      ))}
    </div>
    {prescription.instructions && (
      <div className="mt-3 p-3 bg-yellow-50 rounded">
        <label className="font-semibold block text-yellow-800">
          Instructions:
        </label>
        <p className="text-sm text-yellow-700">{prescription.instructions}</p>
      </div>
    )}
  </div>
);

const LabResults: React.FC<{ labResults: any }> = ({ labResults }) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold mb-3 text-lg">
      Lab Results: {labResults.testName}
    </h3>
    <div className="space-y-2">
      {Object.entries(labResults.results).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between items-center py-2 border-b"
        >
          <span className="font-medium capitalize">{key}:</span>
          <div className="text-right">
            <span className="font-medium">
              {value} {labResults.units[key]}
            </span>
            <div className="text-xs text-gray-500">
              Normal: {labResults.normalRange[key]}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const VisitDetails: React.FC<{ visitDetails: any }> = ({ visitDetails }) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold mb-3 text-lg">Visit Details</h3>
    <div className="space-y-3">
      {visitDetails.diagnosis && (
        <DetailItem label="Diagnosis" value={visitDetails.diagnosis} />
      )}
      {visitDetails.symptoms && visitDetails.symptoms.length > 0 && (
        <div>
          <label className="font-semibold block">Symptoms:</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {visitDetails.symptoms.map((symptom: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}
      {visitDetails.notes && (
        <DetailItem label="Notes" value={visitDetails.notes} />
      )}
    </div>
  </div>
);

const DetailItem: React.FC<{
  label: string;
  value: string;
  capitalize?: boolean;
}> = ({ label, value, capitalize }) => (
  <div>
    <label className="font-semibold block">{label}:</label>
    <p className={capitalize ? "capitalize" : ""}>{value}</p>
  </div>
);
