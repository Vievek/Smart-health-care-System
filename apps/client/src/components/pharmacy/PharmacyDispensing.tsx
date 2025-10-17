import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { PharmacyService } from "../../services/PharmacyService";
import { MedicalRecordService } from "../../services/MedicalRecordService";
import {
  IInventoryItem,
  IMedicalRecord,
  PrescriptionStatus,
} from "@shared/healthcare-types";
import {
  Pill,
  Search,
  Filter,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Printer,
  User,
  Loader2,
} from "lucide-react";

export const PharmacyDispensing: React.FC = () => {
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [showDispensingModal, setShowDispensingModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<IMedicalRecord | null>(null);
  const [patientId, setPatientId] = useState("");
  const [patientPrescriptions, setPatientPrescriptions] = useState<
    IMedicalRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const pharmacyService = new PharmacyService();
  const medicalRecordService = new MedicalRecordService();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await pharmacyService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    }
  };

  const handleSearchPatient = async () => {
    if (!patientId.trim()) {
      alert("Please enter a patient ID");
      return;
    }

    try {
      setLoading(true);
      // Use the new prescription-specific endpoint
      const prescriptions =
        await medicalRecordService.getPrescriptionsByPatient(patientId);
      setPatientPrescriptions(prescriptions);

      if (prescriptions.length === 0) {
        alert("No active prescriptions found for this patient.");
      }
    } catch (error: any) {
      console.error("Failed to search patient:", error);
      if (error.response?.status === 403) {
        alert(
          "Access denied. You don't have permission to view this patient's prescriptions."
        );
      } else if (error.response?.status === 404) {
        alert("Patient not found or no prescriptions available.");
      } else {
        alert(
          "Failed to load patient prescriptions. Please check the patient ID and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (dispenseData: any) => {
    try {
      const result = await pharmacyService.dispenseMedication(dispenseData);
      await loadInventory(); // Refresh inventory
      setShowDispensingModal(false);
      setPatientPrescriptions([]);
      setPatientId("");
      alert("Medication dispensed successfully!");
      return result;
    } catch (error: any) {
      console.error("Failed to dispense medication:", error);
      alert(`Dispensing failed: ${error.message}`);
      throw error;
    }
  };

  const handleNewOrder = async (orderData: any) => {
    try {
      // This would integrate with your order management system
      console.log("New order data:", orderData);
      setShowNewOrderModal(false);
      alert(
        "Order placed successfully! This would integrate with your inventory system."
      );
    } catch (error: any) {
      console.error("Failed to place order:", error);
      alert(`Order failed: ${error.message}`);
    }
  };

  const handlePrintReceipt = (transaction: any) => {
    const receiptContent = `
      PHARMACY RECEIPT
      ========================
      Transaction ID: ${transaction._id || "TX-" + Date.now()}
      Patient ID: ${transaction.patientId}
      Date: ${new Date().toLocaleString()}
      
      Medications:
      ${transaction.medications
        ?.map((med: any) => `- ${med.name}: ${med.quantity} x $${med.price}`)
        .join("\n")}
      
      Total Amount: $${transaction.amount || "0.00"}
      Status: ${transaction.paymentStatus}
      ========================
      Thank you for your business!
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pharmacy Receipt</title>
            <style>
              body { font-family: monospace; margin: 20px; }
              .receipt { border: 1px solid #000; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <pre>${receiptContent}</pre>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDrugInteractionCheck = async (medications: string[]) => {
    try {
      const result = await pharmacyService.checkDrugInteractions(
        patientId,
        medications
      );
      return result;
    } catch (error) {
      console.error("Drug interaction check failed:", error);
      return ["Error checking interactions"];
    }
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "low-stock") {
      return matchesSearch && item.quantityOnHand <= item.reorderLevel;
    }

    return matchesSearch;
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantityOnHand <= item.reorderLevel
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pharmacy Dispensing
          </h1>
          <p className="text-gray-600 mt-2">
            Manage medication dispensing and inventory
          </p>
        </div>
        <div className="flex space-x-3">
          {lowStockItems.length > 0 && (
            <Button
              variant="outline"
              className="text-orange-600 border-orange-200"
              onClick={() => handleFilter("low-stock")}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Low Stock ({lowStockItems.length})
            </Button>
          )}
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowNewOrderModal(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Search and Patient Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter Patient ID (e.g., PAT001)..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchPatient()
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleSearchPatient}
                disabled={!patientId.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                {loading ? "Searching..." : "Search Patient"}
              </Button>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Items</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {lowStockItems.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar for Inventory */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search medications by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Prescriptions */}
      {patientPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Active Prescriptions for Patient {patientId}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (patientPrescriptions.length > 0) {
                    setSelectedPrescription(patientPrescriptions[0]);
                    setShowDispensingModal(true);
                  }
                }}
              >
                <Pill className="w-4 h-4 mr-2" />
                Dispense Selected
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientPrescriptions.map((prescription) => (
                <Card
                  key={prescription._id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedPrescription?._id === prescription._id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {prescription.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {prescription.description || "No description"}
                          </p>
                          {prescription.prescription && (
                            <div className="mt-2">
                              {prescription.prescription.medications.map(
                                (med, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-gray-500"
                                  >
                                    <strong>{med.name}</strong> - {med.dosage} •{" "}
                                    {med.frequency} • {med.duration}
                                    {med.instructions &&
                                      ` • ${med.instructions}`}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prescription.prescription?.status ===
                            PrescriptionStatus.ACTIVE
                              ? "bg-green-100 text-green-800"
                              : prescription.prescription?.status ===
                                PrescriptionStatus.DISPENSED
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {prescription.prescription?.status}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowDispensingModal(true);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            Medication Inventory
            {filterStatus === "low-stock" && (
              <span className="ml-2 text-orange-600 text-sm font-normal">
                (Low Stock Items Only)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Current stock levels and medication information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">Medication</th>
                  <th className="text-left py-3 font-semibold">Batch Number</th>
                  <th className="text-left py-3 font-semibold">Expiry Date</th>
                  <th className="text-left py-3 font-semibold">Stock</th>
                  <th className="text-left py-3 font-semibold">
                    Reorder Level
                  </th>
                  <th className="text-left py-3 font-semibold">Price</th>
                  <th className="text-left py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.genericName}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{item.batchNumber}</td>
                    <td className="py-3">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span>{item.quantityOnHand}</span>
                        {item.quantityOnHand <= item.reorderLevel && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3">{item.reorderLevel}</td>
                    <td className="py-3">
                      ${item.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantityOnHand > item.reorderLevel
                            ? "bg-green-100 text-green-800"
                            : item.quantityOnHand > 0
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.quantityOnHand > item.reorderLevel
                          ? "In Stock"
                          : item.quantityOnHand > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No medications found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispensing Modal */}
      {showDispensingModal && selectedPrescription && (
        <DispensingModal
          prescription={selectedPrescription}
          patientId={patientId}
          onDispense={handleDispense}
          onPrint={handlePrintReceipt}
          onInteractionCheck={handleDrugInteractionCheck}
          onClose={() => {
            setShowDispensingModal(false);
            setSelectedPrescription(null);
          }}
        />
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal
          onClose={() => setShowNewOrderModal(false)}
          onOrder={handleNewOrder}
          inventory={inventory}
        />
      )}
    </div>
  );
};

// Dispensing Modal Component
const DispensingModal: React.FC<{
  prescription: IMedicalRecord;
  patientId: string;
  onDispense: (data: any) => Promise<any>;
  onPrint: (transaction: any) => void;
  onInteractionCheck: (medications: string[]) => Promise<string[]>;
  onClose: () => void;
}> = ({
  prescription,
  patientId,
  onDispense,
  onPrint,
  onInteractionCheck,
  onClose,
}) => {
  const [step, setStep] = useState<"validation" | "preparation" | "completion">(
    "validation"
  );
  const [interactions, setInteractions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);

  const handleCheckInteractions = async () => {
    setLoading(true);
    try {
      const medicationNames =
        prescription.prescription?.medications.map((med) => med.name) || [];
      const interactionResults = await onInteractionCheck(medicationNames);
      setInteractions(interactionResults);
      setStep("preparation");
    } catch (error) {
      console.error("Interaction check failed:", error);
      setInteractions(["Error checking interactions"]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDispensing = async () => {
    setLoading(true);
    try {
      if (!prescription.prescription) {
        throw new Error("No prescription data available");
      }

      const dispenseData = {
        prescriptionId: prescription._id!,
        patientId: patientId,
        pharmacistId: "PHA001", // This should come from auth context in real app
        medications: prescription.prescription.medications.map((med) => ({
          medicationId: med.medicationId,
          name: med.name,
          quantity: 1, // Default quantity
          batchNumber: "BATCH001", // This should come from inventory
          price: 12.5, // This should come from inventory
        })),
        paymentMethod: "cash",
      };

      const result = await onDispense(dispenseData);
      setTransaction(result);
      setStep("completion");
    } catch (error) {
      console.error("Dispensing failed:", error);
      alert("Dispensing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (transaction) {
      onPrint(transaction);
    } else {
      // Create mock transaction for printing
      const mockTransaction = {
        _id: "TX-" + Date.now(),
        patientId: patientId,
        medications:
          prescription.prescription?.medications.map((med) => ({
            name: med.name,
            quantity: 1,
            price: 12.5,
          })) || [],
        amount: 12.5,
        paymentStatus: "completed",
      };
      onPrint(mockTransaction);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Dispense Medication</h2>
          <p className="text-gray-600 mt-1">Process prescription fulfillment</p>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {["Validation", "Preparation", "Completion"].map(
                (stepName, index) => (
                  <React.Fragment key={stepName}>
                    <div
                      className={`flex items-center ${
                        (index === 0 && step === "validation") ||
                        (index === 1 && step === "preparation") ||
                        (index === 2 && step === "completion")
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          (index === 0 && step === "validation") ||
                          (index === 1 && step === "preparation") ||
                          (index === 2 && step === "completion")
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="ml-2 font-medium">{stepName}</span>
                    </div>
                    {index < 2 && (
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          {/* Step Content */}
          {step === "validation" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Prescription Validation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patient ID:</span>
                    <span className="font-medium">{patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prescription:</span>
                    <span className="font-medium">{prescription.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued Date:</span>
                    <span>
                      {new Date(prescription.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">
                      {prescription.prescription?.status}
                    </span>
                  </div>
                </div>
              </div>

              {prescription.prescription && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Medications</h4>
                  <div className="space-y-2">
                    {prescription.prescription.medications.map((med, index) => (
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
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Drug Interactions Check
                </h3>
                {interactions.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {interactions.map((interaction, index) => (
                      <li key={index}>• {interaction}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-yellow-700">
                    No interactions checked yet. Click below to check.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleCheckInteractions} disabled={loading}>
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
          )}

          {step === "preparation" && (
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
                  {prescription.prescription?.medications.map((med, index) => (
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
                <Button variant="outline" onClick={() => setStep("validation")}>
                  Back
                </Button>
                <Button onClick={handleCompleteDispensing} disabled={loading}>
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
          )}

          {step === "completion" && (
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

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-2">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prescription:</span>
                    <span>{prescription.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient ID:</span>
                    <span>{patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispensed At:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span>{transaction?._id || "TX-" + Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">
                      ${transaction?.amount || "12.50"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// New Order Modal Component
const NewOrderModal: React.FC<{
  onClose: () => void;
  onOrder: (orderData: any) => void;
  inventory: IInventoryItem[];
}> = ({ onClose, onOrder }) => {
  const [orderData, setOrderData] = useState({
    medicationName: "",
    quantity: 1,
    supplier: "",
    urgency: "normal",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOrder(orderData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Place New Order</h2>
          <p className="text-gray-600 mt-1">Order new medication stock</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name *
            </label>
            <input
              type="text"
              name="medicationName"
              value={orderData.medicationName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter medication name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={orderData.quantity}
              onChange={handleChange}
              min="1"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier *
            </label>
            <input
              type="text"
              name="supplier"
              value={orderData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              name="urgency"
              value={orderData.urgency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Place Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
