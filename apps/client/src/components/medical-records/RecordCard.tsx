import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { IMedicalRecord } from "@shared/healthcare-types";
import { FileText, Stethoscope, User, Eye, Download } from "lucide-react";
import { MedicalRecordService } from "../../services/MedicalRecordService";
import { useApi } from "../../hooks/useApi";

interface RecordCardProps {
  record: IMedicalRecord;
  onSelect: (record: IMedicalRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, onSelect }) => {
  const medicalRecordService = new MedicalRecordService();

  const { execute: downloadPDF } = useApi(
    () => medicalRecordService.downloadRecordPDF(record._id!),
    {
      onSuccess: (blob) => {
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `medical-record-${record._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
    }
  );

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPDF();
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect(record)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            {getRecordIcon(record.recordType)}
            {record.title}
          </CardTitle>
          <RecordTypeBadge recordType={record.recordType} />
        </div>
        <CardDescription>
          Created {new Date(record.createdDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {record.description || "No description available"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            Author ID: {record.authorId}
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(record);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecordTypeBadge: React.FC<{ recordType: string }> = ({ recordType }) => {
  const badgeConfig = {
    lab: { color: "bg-blue-100 text-blue-800" },
    prescription: { color: "bg-green-100 text-green-800" },
    imaging: { color: "bg-purple-100 text-purple-800" },
  };

  const config = badgeConfig[recordType as keyof typeof badgeConfig] || {
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {recordType}
    </span>
  );
};

const getRecordIcon = (recordType: string) => {
  switch (recordType) {
    case "lab":
      return <FileText className="w-5 h-5 mr-2 inline" />;
    case "prescription":
      return <Stethoscope className="w-5 h-5 mr-2 inline" />;
    case "imaging":
      return <FileText className="w-5 h-5 mr-2 inline" />;
    default:
      return <FileText className="w-5 h-5 mr-2 inline" />;
  }
};
