import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { MedicalRecordService } from "../../services/MedicalRecordService";
import { IMedicalRecord, UserRole } from "@shared/healthcare-types";
import {
  FileText,
  Download,
  Calendar,
  Stethoscope,
  User,
  Search,
} from "lucide-react";

interface MedicalRecordsDashboardProps {
  userRole?: UserRole;
}

export const MedicalRecordsDashboard: React.FC<
  MedicalRecordsDashboardProps
> = ({ userRole }) => {
  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const medicalRecordService = new MedicalRecordService();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await medicalRecordService.getRecords();
       console.log("Loaded medical records:", data);
      setRecords(data);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (recordId: string) => {
    try {
      const blob = await medicalRecordService.downloadRecordPDF(recordId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-record-${recordId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading medical records...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section - Exact from Storyboard Frame 4 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">
            Access and manage your health information
          </p>
        </div>
        {userRole === UserRole.DOCTOR && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Search Patients
          </Button>
        )}
      </div>

      {/* Search Bar - From Storyboard Frame 4 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search records by title or type..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {userRole === UserRole.PATIENT && (
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </Button>
          )}
        </div>
      </div>

      {/* Records Grid - From Storyboard Frame 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card
            key={record._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {getRecordIcon(record.recordType)}
                  {record.title}
                </CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.recordType === "lab"
                      ? "bg-blue-100 text-blue-800"
                      : record.recordType === "prescription"
                      ? "bg-green-100 text-green-800"
                      : record.recordType === "imaging"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {record.recordType}
                </span>
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
                  Dr. {record.authorId}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(record._id!);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admission History Section - From Storyboard Frame 6 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Admission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records
              .filter((record) => record.recordType === "admission")
              .map((admission) => (
                <div
                  key={admission._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{admission.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(admission.createdDate).toLocaleDateString()} •
                      {admission.visitDetails?.diagnosis || "General admission"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
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

// Record Detail Modal Component
const RecordDetailModal: React.FC<{
  record: IMedicalRecord;
  onClose: () => void;
  onDownload: (id: string) => void;
}> = ({ record, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{record.title}</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Record Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Record Type:</label>
              <p>{record.recordType}</p>
            </div>
            <div>
              <label className="font-semibold">Created Date:</label>
              <p>{new Date(record.createdDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Prescription Details */}
          {record.prescription && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Prescription Details</h3>
              <div className="space-y-2">
                {record.prescription.medications.map((med, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {med.dosage} • {med.frequency}
                      </span>
                    </div>
                    <span className="text-sm">{med.duration}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm">{record.prescription.instructions}</p>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                Lab Results: {record.labResults.testName}
              </h3>
              <div className="space-y-2">
                {Object.entries(record.labResults.results).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-medium">
                        {value} {record.labResults?.units[key]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onDownload(record._id!)}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
