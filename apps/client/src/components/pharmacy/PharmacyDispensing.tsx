import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PharmacyService } from '../../services/PharmacyService';
import { MedicalRecordService } from '../../services/MedicalRecordService';
import { IInventoryItem, IMedicalRecord, IUser } from '@shared/healthcare-types';
import { Pill, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { PatientSearch } from '../common/PatientSearch';
import { SearchBar } from '../common/SearchBar';
import { InventoryTable } from './InventoryTable';
import { DispensingModal } from './DispensingModal';
import { NewOrderModal } from './NewOrderModal';
import { useApi } from '../../hooks/useApi';

export const PharmacyDispensing: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<IMedicalRecord[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<IMedicalRecord | null>(null);
  const [showDispensingModal, setShowDispensingModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const pharmacyService = new PharmacyService();
  const medicalRecordService = new MedicalRecordService();

  const { data: inventory, execute: loadInventory } = useApi(() => pharmacyService.getInventory());
  
  // FIXED: Load prescriptions when patient is selected
  const { execute: loadPrescriptions, loading: prescriptionsLoading } = useApi(
    async () => {
      if (!selectedPatient) throw new Error('No patient selected');
      const prescriptions = await medicalRecordService.getPrescriptionsByPatient(selectedPatient._id!);
      return prescriptions;
    },
    {
      onSuccess: (prescriptions) => {
        setPatientPrescriptions(prescriptions);
        if (prescriptions.length === 0) {
          alert('No active prescriptions found for this patient.');
        }
      },
      onError: (error: any) => {
        console.error('Failed to load prescriptions:', error);
        if (error.response?.status === 403) {
          alert("Access denied. You don't have permission to view this patient's prescriptions.");
        } else if (error.response?.status === 404) {
          alert("Patient not found or no prescriptions available.");
        } else {
          alert("Failed to load patient prescriptions. Please check the patient and try again.");
        }
      }
    }
  );

  useEffect(() => {
    loadInventory();
  }, []);

  // FIXED: Load prescriptions automatically when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      loadPrescriptions();
    } else {
      setPatientPrescriptions([]);
    }
  }, [selectedPatient]);

  // FIXED: Calculate low stock items here
  const lowStockItems = (inventory || []).filter(
    item => item.quantityOnHand <= item.reorderLevel
  );

  const handleDispense = async (dispenseData: any) => {
    try {
      await pharmacyService.dispenseMedication(dispenseData);
      await loadInventory();
      setShowDispensingModal(false);
      setPatientPrescriptions([]);
      setSelectedPatient(null);
      alert('Medication dispensed successfully!');
    } catch (error: any) {
      alert(`Dispensing failed: ${error.message}`);
      throw error;
    }
  };

  const handlePatientSelect = (patient: IUser) => {
    setSelectedPatient(patient);
    setSelectedPrescription(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header 
        lowStockCount={lowStockItems.length}
        onShowLowStock={() => setFilterStatus('low-stock')}
        onNewOrder={() => setShowNewOrderModal(true)}
      />

      <PatientSearchSection
        selectedPatient={selectedPatient}
        onPatientSelect={handlePatientSelect}
        prescriptionsLoading={prescriptionsLoading}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {selectedPatient && (
        <SelectedPatientInfo patient={selectedPatient} />
      )}

      {patientPrescriptions.length > 0 && (
        <PrescriptionsList
          prescriptions={patientPrescriptions}
          selectedPrescription={selectedPrescription}
          onSelectPrescription={setSelectedPrescription}
          onDispense={() => setShowDispensingModal(true)}
        />
      )}

      <InventorySection
        inventory={inventory || []}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
      />

      <DispensingModal
        isOpen={showDispensingModal}
        onClose={() => {
          setShowDispensingModal(false);
          setSelectedPrescription(null);
        }}
        prescription={selectedPrescription}
        patient={selectedPatient}
        onDispense={handleDispense}
      />

      <NewOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        inventory={inventory || []}
      />
    </div>
  );
};

const Header: React.FC<{
  lowStockCount: number;
  onShowLowStock: () => void;
  onNewOrder: () => void;
}> = ({ lowStockCount, onShowLowStock, onNewOrder }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dispensing</h1>
      <p className="text-gray-600 mt-2">Manage medication dispensing and inventory</p>
    </div>
    <div className="flex space-x-3">
      {lowStockCount > 0 && (
        <Button
          variant="outline"
          className="text-orange-600 border-orange-200"
          onClick={onShowLowStock}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Low Stock ({lowStockCount})
        </Button>
      )}
      <Button className="bg-green-600 hover:bg-green-700" onClick={onNewOrder}>
        <ShoppingCart className="w-4 h-4 mr-2" />
        New Order
      </Button>
    </div>
  </div>
);

const PatientSearchSection: React.FC<{
  selectedPatient: IUser | null;
  onPatientSelect: (patient: IUser) => void;
  prescriptionsLoading: boolean;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}> = ({ selectedPatient, onPatientSelect, prescriptionsLoading, filterStatus, onFilterChange }) => {
  // FIXED: Calculate low stock items here for the LowStockCard
  const { data: inventory } = useApi(() => new PharmacyService().getInventory());
  const lowStockItems = (inventory || []).filter(item => item.quantityOnHand <= item.reorderLevel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <PatientSearch
              onPatientSelect={onPatientSelect}
              selectedPatient={selectedPatient}
            />
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Items</option>
                <option value="low-stock">Low Stock</option>
              </select>
            </div>
          </div>
          {prescriptionsLoading && (
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading prescriptions...
            </div>
          )}
        </CardContent>
      </Card>

      <LowStockCard lowStockCount={lowStockItems.length} />
    </div>
  );
};

const LowStockCard: React.FC<{ lowStockCount: number }> = ({ lowStockCount }) => (
  <Card className="bg-blue-50 border-blue-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-800">Low Stock Items</p>
          <p className="text-2xl font-bold text-blue-900">{lowStockCount}</p>
        </div>
        <AlertTriangle className="w-8 h-8 text-blue-600" />
      </div>
    </CardContent>
  </Card>
);

const SelectedPatientInfo: React.FC<{ patient: IUser }> = ({ patient }) => (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-blue-800">Selected Patient:</h4>
    <p className="text-blue-700">
      {patient.firstName} {patient.lastName}
      (ID: {patient._id}, National ID: {patient.nationalId})
    </p>
  </div>
);

const PrescriptionsList: React.FC<{
  prescriptions: IMedicalRecord[];
  selectedPrescription: IMedicalRecord | null;
  onSelectPrescription: (prescription: IMedicalRecord) => void;
  onDispense: () => void;
}> = ({ prescriptions, selectedPrescription, onSelectPrescription, onDispense }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center">
          <Pill className="w-5 h-5 mr-2" />
          Active Prescriptions
        </div>
        <Button size="sm" onClick={onDispense} disabled={!selectedPrescription}>
          <Pill className="w-4 h-4 mr-2" />
          Dispense Selected
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <PrescriptionCard
            key={prescription._id}
            prescription={prescription}
            isSelected={selectedPrescription?._id === prescription._id}
            onSelect={onSelectPrescription}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

const PrescriptionCard: React.FC<{
  prescription: IMedicalRecord;
  isSelected: boolean;
  onSelect: (prescription: IMedicalRecord) => void;
}> = ({ prescription, isSelected, onSelect }) => (
  <Card
    className={`cursor-pointer hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}
    onClick={() => onSelect(prescription)}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Pill className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">{prescription.title}</h3>
            <p className="text-sm text-gray-600">
              {prescription.description || 'No description'}
            </p>
            {prescription.prescription && (
              <div className="mt-2">
                {prescription.prescription.medications.map((med, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    <strong>{med.name}</strong> - {med.dosage} • {med.frequency} • {med.duration}
                    {med.instructions && ` • ${med.instructions}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => onSelect(prescription)}>
            Select
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const InventorySection: React.FC<{
  inventory: IInventoryItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
}> = ({ inventory, searchTerm, onSearchChange, filterStatus }) => (
  <div className="space-y-4">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search medications by name..."
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => {
              onSearchChange('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    <InventoryTable
      inventory={inventory}
      searchTerm={searchTerm}
      filterStatus={filterStatus}
    />
  </div>
);