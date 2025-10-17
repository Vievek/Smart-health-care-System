import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { IInventoryItem } from "@shared/healthcare-types";
import { ShoppingCart } from "lucide-react";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: IInventoryItem[];
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [orderData, setOrderData] = useState({
    medicationName: "",
    quantity: 1,
    supplier: "",
    urgency: "normal" as "low" | "normal" | "high" | "urgent",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would call an order service
    console.log("New order data:", orderData);
    onClose();
    alert(
      "Order placed successfully! This would integrate with your inventory system."
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Place New Order"
      description="Order new medication stock"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Medication Name *"
          name="medicationName"
          type="text"
          value={orderData.medicationName}
          onChange={handleChange}
          placeholder="Enter medication name"
          required
        />

        <FormField
          label="Quantity *"
          name="quantity"
          type="number"
          value={orderData.quantity}
          onChange={handleChange}
          min={1}
          max={1000}
          required
        />

        <FormField
          label="Supplier *"
          name="supplier"
          type="text"
          value={orderData.supplier}
          onChange={handleChange}
          placeholder="Enter supplier name"
          required
        />

        <FormField
          label="Urgency"
          name="urgency"
          type="select"
          value={orderData.urgency}
          onChange={handleChange}
          options={[
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />

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
    </Modal>
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "number" | "select";
  value: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  options,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    )}
  </div>
);
