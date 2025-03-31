
import React from 'react';
import { Link } from 'react-router-dom';
import { House } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface HouseCardProps {
  house: House;
}

const HouseCard: React.FC<HouseCardProps> = ({ house }) => {
  return (
    <Link to={`/houses/${house.id}`} className="house-card group">
      <div className="relative overflow-hidden">
        <img 
          src={house.images[0]} 
          alt={house.title} 
          className="house-image group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className={`house-badge ${house.available ? 'house-badge-available' : 'house-badge-sold'}`}>
            {house.available ? 'Available' : 'Sold'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium truncate">{house.title}</h3>
        <p className="text-muted-foreground text-sm mb-2">{house.location}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-semibold text-estate-900">{formatCurrency(house.price)}</span>
          <span className="text-xs px-2 py-1 bg-secondary rounded-full">
            {house.houseType === 'single' && 'Single Story'}
            {house.houseType === 'two' && 'Two Story'}
            {house.houseType === 'three' && 'Three Story'}
            {house.houseType === 'box' && 'Box Style'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HouseCard;
