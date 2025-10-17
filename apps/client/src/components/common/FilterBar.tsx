import React from "react";
import { Filter } from "lucide-react";

interface FilterBarProps {
  filters: { value: string; label: string }[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Filter className="w-4 h-4 text-gray-500" />
      <select
        value={selectedFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {filters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
};
