
import React from 'react';
import { House } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HouseFilterProps {
  onFilterChange: (filters: { houseType?: House['houseType'], availability?: boolean }) => void;
  currentFilters: { houseType?: House['houseType'], availability?: boolean };
}

const HouseFilter: React.FC<HouseFilterProps> = ({ onFilterChange, currentFilters }) => {
  const handleHouseTypeChange = (value: House['houseType'] | 'all') => {
    onFilterChange({
      ...currentFilters,
      houseType: value === 'all' ? undefined : value
    });
  };

  const handleAvailabilityChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      availability: value === 'all' ? undefined : value === 'available'
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-card shadow-sm rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">House Type</label>
          <Select 
            onValueChange={handleHouseTypeChange} 
            defaultValue={currentFilters.houseType || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select house type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single Story</SelectItem>
              <SelectItem value="two">Two Story</SelectItem>
              <SelectItem value="three">Three Story</SelectItem>
              <SelectItem value="box">Box Style</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Availability</label>
          <Select 
            onValueChange={handleAvailabilityChange} 
            defaultValue={
              currentFilters.availability === undefined 
                ? 'all' 
                : currentFilters.availability ? 'available' : 'sold'
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HouseFilter;
