import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IInventoryItem } from "@shared/healthcare-types";
import { Pill, AlertTriangle } from "lucide-react";

interface InventoryTableProps {
  inventory: IInventoryItem[];
  searchTerm: string;
  filterStatus: string;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  searchTerm,
  filterStatus,
}) => {
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "low-stock") {
      return matchesSearch && item.quantityOnHand <= item.reorderLevel;
    }

    return matchesSearch;
  });

  if (filteredInventory.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No medications found matching your criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                <th className="text-left py-3 font-semibold">Reorder Level</th>
                <th className="text-left py-3 font-semibold">Price</th>
                <th className="text-left py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <InventoryTableRow key={item._id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const InventoryTableRow: React.FC<{ item: IInventoryItem }> = ({ item }) => {
  const getStatusInfo = () => {
    if (item.quantityOnHand > item.reorderLevel) {
      return { text: "In Stock", color: "bg-green-100 text-green-800" };
    } else if (item.quantityOnHand > 0) {
      return { text: "Low Stock", color: "bg-orange-100 text-orange-800" };
    } else {
      return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3">
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-600">{item.genericName}</div>
        </div>
      </td>
      <td className="py-3">{item.batchNumber}</td>
      <td className="py-3">{new Date(item.expiryDate).toLocaleDateString()}</td>
      <td className="py-3">
        <div className="flex items-center space-x-2">
          <span>{item.quantityOnHand}</span>
          {item.quantityOnHand <= item.reorderLevel && (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          )}
        </div>
      </td>
      <td className="py-3">{item.reorderLevel}</td>
      <td className="py-3">${item.price?.toFixed(2) || "0.00"}</td>
      <td className="py-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
        >
          {statusInfo.text}
        </span>
      </td>
    </tr>
  );
};
