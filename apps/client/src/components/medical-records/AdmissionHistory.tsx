import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { IMedicalRecord } from "@shared/healthcare-types";
import { Calendar, Download } from "lucide-react";
import { MedicalRecordService } from "../../services/MedicalRecordService";

interface AdmissionHistoryProps {
  records: IMedicalRecord[];
}

export const AdmissionHistory: React.FC<AdmissionHistoryProps> = ({
  records,
}) => {
  const medicalRecordService = new MedicalRecordService();

  const handleDownloadPDF = async (recordId: string) => {
    try {
      const blob = await medicalRecordService.downloadRecordPDF(recordId);
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admission-record-${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const admissionRecords = records.filter(
    (record) => record.recordType === "admission"
  );

  if (admissionRecords.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Admission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {admissionRecords.map((admission) => (
            <AdmissionRecord
              key={admission._id}
              admission={admission}
              onDownload={() => handleDownloadPDF(admission._id!)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AdmissionRecord: React.FC<{
  admission: IMedicalRecord;
  onDownload: () => void;
}> = ({ admission, onDownload }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div>
      <h4 className="font-semibold">{admission.title}</h4>
      <p className="text-sm text-gray-600">
        {new Date(admission.createdDate).toLocaleDateString()} •
        {admission.visitDetails?.diagnosis || "General admission"}
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onDownload}>
      <Download className="w-4 h-4 mr-1" />
      Download
    </Button>
  </div>
);
