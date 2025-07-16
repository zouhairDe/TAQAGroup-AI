import React, { useState, useEffect, useRef } from 'react';
import { EquipmentService } from '@/lib/services/equipment-service';
import { Equipment } from '@/types/database-types';

interface EquipmentAutocompleteProps {
  value: string;
  onChange: (value: string, equipment?: Equipment) => void;
  onEquipmentSelect?: (equipment: Equipment) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showIdField?: boolean;
  selectedEquipmentId?: string;
  onEquipmentIdChange?: (id: string) => void;
}

export const EquipmentAutocomplete: React.FC<EquipmentAutocompleteProps> = ({
  value,
  onChange,
  onEquipmentSelect,
  placeholder = "Rechercher un équipement...",
  label = "Équipement",
  required = false,
  disabled = false,
  className = "",
  showIdField = false,
  selectedEquipmentId = "",
  onEquipmentIdChange
}) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load equipment data when component mounts or search term changes
  useEffect(() => {
    const loadEquipment = async () => {
      if (searchTerm.length === 0) {
        // Load some default equipment when no search term
        try {
          setLoading(true);
          const equipment = await EquipmentService.getAllEquipment({ limit: 10 });
          setEquipmentList(equipment);
        } catch (error) {
          console.error('Error loading equipment:', error);
          setEquipmentList([]);
        } finally {
          setLoading(false);
        }
      } else if (searchTerm.length >= 2) {
        // Search equipment when user types
        try {
          setLoading(true);
          const equipment = await EquipmentService.searchEquipment(searchTerm, 10);
          setEquipmentList(equipment);
        } catch (error) {
          console.error('Error searching equipment:', error);
          setEquipmentList([]);
        } finally {
          setLoading(false);
        }
      } else {
        setEquipmentList([]);
      }
    };

    const debounceTimer = setTimeout(loadEquipment, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    setShowDropdown(inputValue.length > 0);
    onChange(inputValue);
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSearchTerm(equipment.name);
    setShowDropdown(false);
    onChange(equipment.name, equipment);
    if (onEquipmentSelect) {
      onEquipmentSelect(equipment);
    }
    if (onEquipmentIdChange) {
      onEquipmentIdChange(equipment.id);
    }
  };

  const handleEquipmentIdChange = (id: string) => {
    if (onEquipmentIdChange) {
      onEquipmentIdChange(id);
    }
    // Try to find equipment by ID and update name
    const equipment = equipmentList.find(eq => eq.id === id);
    if (equipment) {
      setSearchTerm(equipment.name);
      onChange(equipment.name, equipment);
      if (onEquipmentSelect) {
        onEquipmentSelect(equipment);
      }
    }
  };

  const filteredEquipment = equipmentList.filter(equipment =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Equipment Name Field with Autocomplete */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
        />
        
        {showDropdown && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                Chargement...
              </div>
            ) : filteredEquipment.length > 0 ? (
              filteredEquipment.map((equipment, index) => (
                <div
                  key={`${equipment.id}-${index}`}
                  onClick={() => handleEquipmentSelect(equipment)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {equipment.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Code: {equipment.code} | ID: {equipment.id}
                  </div>
                  {equipment.type && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Type: {equipment.type}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm.length < 2 ? 'Tapez au moins 2 caractères pour rechercher' : 'Aucun équipement trouvé'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Equipment ID Field (optional) - now after the name field */}
      {showIdField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ID Équipement
          </label>
          <input
            type="text"
            value={selectedEquipmentId}
            onChange={(e) => handleEquipmentIdChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="ID de l'équipement"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}; 