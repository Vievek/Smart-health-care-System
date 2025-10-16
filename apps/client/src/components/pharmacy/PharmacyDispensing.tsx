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
import { IInventoryItem } from "@shared/healthcare-types";
import {
  Pill,
  Search,
  Filter,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";

export const PharmacyDispensing: React.FC = () => {
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDispensingModal, setShowDispensingModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const pharmacyService = new PharmacyService();

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

  const handleDispense = async (dispenseData: any) => {
    try {
      await pharmacyService.dispenseMedication(dispenseData);
      await loadInventory();
      setShowDispensingModal(false);
    } catch (error) {
      console.error("Failed to dispense medication:", error);
    }
  };

  const lowStockItems = inventory.filter(
    (item) => item.quantityOnHand <= item.reorderLevel
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - From Storyboard */}
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
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Low Stock ({lowStockItems.length})
            </Button>
          )}
          <Button className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Search and Patient Selection - From Storyboard Panel 1-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Scan digital health card or search patient by ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
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

      {/* Patient Prescriptions - From Storyboard Panel 3-4 */}
      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                Active Prescriptions for Patient
              </div>
              <Button size="sm" onClick={() => setShowDispensingModal(true)}>
                <Pill className="w-4 h-4 mr-2" />
                Dispense Selected
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock prescription data - would come from API */}
              {[
                {
                  id: "1",
                  medication: "Amoxicillin 500mg",
                  dosage: "1 tablet",
                  frequency: "3 times daily",
                  duration: "7 days",
                  status: "active",
                },
                {
                  id: "2",
                  medication: "Ibuprofen 400mg",
                  dosage: "1 tablet",
                  frequency: "As needed",
                  duration: "10 days",
                  status: "active",
                },
              ].map((prescription) => (
                <Card
                  key={prescription.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
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
                            {prescription.medication}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {prescription.dosage} • {prescription.frequency} •{" "}
                            {prescription.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prescription.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {prescription.status}
                        </span>
                        <Button size="sm" variant="outline">
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

      {/* Inventory Overview - From Storyboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            Medication Inventory
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
                  <th className="text-left py-3 font-semibold">Price</th>
                  <th className="text-left py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
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
                    <td className="py-3">${item.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantityOnHand > item.reorderLevel
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.quantityOnHand > item.reorderLevel
                          ? "In Stock"
                          : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dispensing Modal */}
      {showDispensingModal && selectedPrescription && (
        <DispensingModal
          prescription={selectedPrescription}
          onDispense={handleDispense}
          onClose={() => {
            setShowDispensingModal(false);
            setSelectedPrescription(null);
          }}
        />
      )}
    </div>
  );
};

// Dispensing Modal Component - From Storyboard Panel 5-8
const DispensingModal: React.FC<{
  prescription: any;
  onDispense: (data: any) => void;
  onClose: () => void;
}> = ({ prescription, onDispense, onClose }) => {
  const [step, setStep] = useState<"validation" | "preparation" | "completion">(
    "validation"
  );
  const [interactions, setInteractions] = useState<string[]>([]);

  const handleCheckInteractions = async () => {
    // Mock interaction check - would be API call in real app
    setInteractions(["No significant interactions found"]);
    setStep("preparation");
  };

  const handleCompleteDispensing = () => {
    onDispense({
      prescriptionId: prescription.id,
      patientId: "patient123",
      medications: [
        {
          medicationId: "med123",
          quantity: 1,
        },
      ],
    });
    setStep("completion");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
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
                    <span>Medication:</span>
                    <span className="font-medium">
                      {prescription.medication}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dosage:</span>
                    <span>{prescription.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span>{prescription.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {interactions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Drug Interactions Check
                  </h3>
                  <ul className="text-sm space-y-1">
                    {interactions.map((interaction, index) => (
                      <li key={index}>• {interaction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleCheckInteractions}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validate & Continue
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
                  No interactions found. Ready for dispensing.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Medication Preparation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">
                      {prescription.medication}
                    </span>
                    <span className="text-sm text-gray-600">In stock</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Pill className="w-4 h-4 text-gray-400" />
                    <span>Preparing medication for dispensing...</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setStep("validation")}>
                  Back
                </Button>
                <Button onClick={handleCompleteDispensing}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Complete Dispensing
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
                    <span>Medication:</span>
                    <span>{prescription.medication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispensed At:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span>TX-{Date.now()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button onClick={onClose}>
                  <FileText className="w-4 h-4 mr-2" />
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
