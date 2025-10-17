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
  Eye,
  Filter,
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
  const [patientSearchId, setPatientSearchId] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const medicalRecordService = new MedicalRecordService();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      let data;
      if (userRole === UserRole.DOCTOR && patientSearchId) {
        data = await medicalRecordService.getRecords(patientSearchId);
      } else {
        data = await medicalRecordService.getRecords();
      }
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

      // Create a proper PDF blob
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-record-${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const handlePatientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecords();
  };

  const handleDateFilter = (days: number) => {
    if (days === 0) {
      setDateFilter("");
      loadRecords();
      return;
    }

    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - days);
    setDateFilter(filterDate.toISOString());

    // Filter records locally
    const filtered = records.filter(
      (record) => new Date(record.createdDate) >= filterDate
    );
    setRecords(filtered);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.description &&
        record.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
      {/* Header Section */}
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

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search records by title, type, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Doctor Patient Search */}
          {userRole === UserRole.DOCTOR && (
            <form
              onSubmit={handlePatientSearch}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Patient ID..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={patientSearchId}
                onChange={(e) => setPatientSearchId(e.target.value)}
              />
              <Button type="submit" variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search Patient
              </Button>
            </form>
          )}

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilter(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">All Dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card
            key={record._id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedRecord(record)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecord(record);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Records Message */}
      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              No medical records found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admission History Section */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(admission._id!)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            {records.filter((record) => record.recordType === "admission")
              .length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No admission history found.
              </p>
            )}
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
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Record Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block">Record Type:</label>
              <p className="capitalize">{record.recordType}</p>
            </div>
            <div>
              <label className="font-semibold block">Created Date:</label>
              <p>{new Date(record.createdDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="font-semibold block">Patient ID:</label>
              <p>{record.patientId}</p>
            </div>
            <div>
              <label className="font-semibold block">Author ID:</label>
              <p>{record.authorId}</p>
            </div>
          </div>

          {/* Description */}
          {record.description && (
            <div>
              <label className="font-semibold block">Description:</label>
              <p className="mt-1">{record.description}</p>
            </div>
          )}

          {/* Prescription Details */}
          {record.prescription && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">
                Prescription Details
              </h3>
              <div className="space-y-3">
                {record.prescription.medications.map((med, index) => (
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
              {record.prescription.instructions && (
                <div className="mt-3 p-3 bg-yellow-50 rounded">
                  <label className="font-semibold block text-yellow-800">
                    Instructions:
                  </label>
                  <p className="text-sm text-yellow-700">
                    {record.prescription.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">
                Lab Results: {record.labResults.testName}
              </h3>
              <div className="space-y-2">
                {Object.entries(record.labResults.results).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span className="font-medium capitalize">{key}:</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {value} {record.labResults?.units[key]}
                        </span>
                        <div className="text-xs text-gray-500">
                          Normal: {record.labResults?.normalRange[key]}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Visit Details */}
          {record.visitDetails && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">Visit Details</h3>
              <div className="space-y-3">
                {record.visitDetails.diagnosis && (
                  <div>
                    <label className="font-semibold block">Diagnosis:</label>
                    <p>{record.visitDetails.diagnosis}</p>
                  </div>
                )}
                {record.visitDetails.symptoms &&
                  record.visitDetails.symptoms.length > 0 && (
                    <div>
                      <label className="font-semibold block">Symptoms:</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.visitDetails.symptoms.map((symptom, index) => (
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
                {record.visitDetails.notes && (
                  <div>
                    <label className="font-semibold block">Notes:</label>
                    <p className="mt-1">{record.visitDetails.notes}</p>
                  </div>
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
