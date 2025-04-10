
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { House } from '@/types';
import { getHouses } from '@/services/houseService';
import HouseCard from '@/components/HouseCard';
import HouseFilter from '@/components/HouseFilter';

const HousesPage = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    houseType?: House['houseType'];
    availability?: boolean;
  }>({});
  
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const allHouses = await getHouses();
        setHouses(allHouses);
        setFilteredHouses(allHouses);
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHouses();
  }, []);
  
  useEffect(() => {
    let result = [...houses];
    
    if (filters.houseType) {
      result = result.filter(house => house.houseType === filters.houseType);
    }
    
    if (filters.availability !== undefined) {
      result = result.filter(house => house.available === filters.availability);
    }
    
    setFilteredHouses(result);
  }, [filters, houses]);
  
  const handleFilterChange = (newFilters: {
    houseType?: House['houseType'];
    availability?: boolean;
  }) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <h1 className="text-3xl font-serif mb-6">Discover Our Houses</h1>
          
          <HouseFilter onFilterChange={handleFilterChange} currentFilters={filters} />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div key={index} className="h-80 bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {filteredHouses.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">No houses found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHouses.map((house) => (
                    <HouseCard key={house._id} house={house} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-estate-950 text-white py-6">
        <div className="container text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HousesPage;
