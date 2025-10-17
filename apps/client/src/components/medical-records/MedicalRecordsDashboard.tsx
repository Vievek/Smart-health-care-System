import React, { useState, useEffect } from "react";
import { Card, CardContent} from "../ui/card";
import { Button } from "../ui/button";
import { MedicalRecordService } from "../../services/MedicalRecordService";
import { IMedicalRecord, UserRole, IUser } from "@shared/healthcare-types";
import { FileText, Search } from "lucide-react";
import { SearchBar } from "../common/SearchBar";
import { RecordCard } from "./RecordCard";
import { RecordDetailModal } from "./RecordDetailModal";
import { AdmissionHistory } from "./AdmissionHistory";
import { PatientSearch } from "../common/PatientSearch";
import { useApi } from "../../hooks/useApi";

interface MedicalRecordsDashboardProps {
  userRole?: UserRole;
}

export const MedicalRecordsDashboard: React.FC<
  MedicalRecordsDashboardProps
> = ({ userRole }) => {
  const [selectedRecord, setSelectedRecord] = useState<IMedicalRecord | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  // const { user: currentUser } = useAuth();
  const medicalRecordService = new MedicalRecordService();

  const {
    data: records,
    loading,
    execute: loadRecords,
  } = useApi(() => medicalRecordService.getRecords(selectedPatient?._id));

  useEffect(() => {
    loadRecords();
  }, [selectedPatient]);

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
  };

  const filteredRecords = (records || []).filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.description &&
        record.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePatientSelect = (patient: IUser) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header
        userRole={userRole}
        onTogglePatientSearch={() => setShowPatientSearch(!showPatientSearch)}
        showPatientSearch={showPatientSearch}
      />

      {userRole === UserRole.DOCTOR && showPatientSearch && (
        <PatientSearch
          onPatientSelect={handlePatientSelect}
          selectedPatient={selectedPatient}
        />
      )}

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilter}
      />

      {selectedPatient && <SelectedPatientInfo patient={selectedPatient} />}

      <RecordsGrid
        records={filteredRecords}
        loading={loading}
        onRecordSelect={setSelectedRecord}
      />

      <AdmissionHistory records={records || []} />

      <RecordDetailModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};

const Header: React.FC<{
  userRole?: UserRole;
  onTogglePatientSearch: () => void;
  showPatientSearch: boolean;
}> = ({ userRole, onTogglePatientSearch, showPatientSearch }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
      <p className="text-gray-600 mt-2">
        Access and manage your health information
      </p>
    </div>
    {userRole === UserRole.DOCTOR && (
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={onTogglePatientSearch}
      >
        <Search className="w-4 h-4 mr-2" />
        {showPatientSearch ? "Hide Search" : "Search Patients"}
      </Button>
    )}
  </div>
);

const SearchAndFilter: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
}> = ({ searchTerm, onSearchChange, dateFilter, onDateFilterChange }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center space-x-4">
      <SearchBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search records by title, type, or description..."
        className="flex-1"
      />
      <div className="flex items-center space-x-2">
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>
  </div>
);

const SelectedPatientInfo: React.FC<{ patient: IUser }> = ({ patient }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 className="font-semibold text-blue-800">Viewing Records for:</h4>
    <p className="text-blue-700">
      {patient.firstName} {patient.lastName}
      (ID: {patient._id}, National ID: {patient.nationalId})
    </p>
  </div>
);

const RecordsGrid: React.FC<{
  records: IMedicalRecord[];
  loading: boolean;
  onRecordSelect: (record: IMedicalRecord) => void;
}> = ({ records, loading, onRecordSelect }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading medical records...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No medical records found matching your criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <RecordCard
          key={record._id}
          record={record}
          onSelect={onRecordSelect}
        />
      ))}
    </div>
  );
};
