
import { House } from '@/types';

// Mock house data for the demo
const HOUSES: House[] = [
  {
    id: '1',
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    ],
    title: 'Modern Minimalist Villa',
    description: 'Contemporary single-story villa with open floor plan, floor-to-ceiling windows, and a private garden.',
    houseType: 'single',
    location: 'Palm Meadows, Bangalore',
    price: 1200000,
    available: true
  },
  {
    id: '2',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    ],
    title: 'Traditional Two-Story Bungalow',
    description: 'Elegant two-story home with traditional architecture, spacious rooms, and a landscaped garden.',
    houseType: 'two',
    location: 'Whitefield, Bangalore',
    price: 1800000,
    available: true
  },
  {
    id: '3',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1692&q=80',
    ],
    title: 'Luxury Three-Story Mansion',
    description: 'Opulent three-story mansion with premium finishes, home theater, swimming pool, and panoramic city views.',
    houseType: 'three',
    location: 'Koramangala, Bangalore',
    price: 3500000,
    available: false
  },
  {
    id: '4',
    images: [
      'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    ],
    title: 'Modern Box-Style Residence',
    description: 'Contemporary box-style home with minimalist design, smart home features, and eco-friendly materials.',
    houseType: 'box',
    location: 'Indiranagar, Bangalore',
    price: 2200000,
    available: true
  },
  {
    id: '5',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    ],
    title: 'Classic Single-Story Villa',
    description: 'Timeless single-story villa with classic architecture, hardwood floors, and a covered patio.',
    houseType: 'single',
    location: 'JP Nagar, Bangalore',
    price: 1500000,
    available: true
  },
  {
    id: '6',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      'https://images.unsplash.com/photo-1600047508788-26bb381500e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1692&q=80',
    ],
    title: 'Modern Two-Story Townhouse',
    description: 'Contemporary two-story townhouse with clean lines, open floor plan, and a rooftop terrace.',
    houseType: 'two',
    location: 'HSR Layout, Bangalore',
    price: 1900000,
    available: false
  }
];

export const getHouses = async (filters?: Partial<{ houseType: House['houseType'], available: boolean }>) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredHouses = [...HOUSES];
  
  if (filters) {
    if (filters.houseType) {
      filteredHouses = filteredHouses.filter(house => house.houseType === filters.houseType);
    }
    
    if (filters.available !== undefined) {
      filteredHouses = filteredHouses.filter(house => house.available === filters.available);
    }
  }
  
  return filteredHouses;
};

export const getHouseById = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const house = HOUSES.find(house => house.id === id);
  
  if (!house) {
    throw new Error('House not found');
  }
  
  return house;
};

export const updateHouse = async (id: string, updates: Partial<House>) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const houseIndex = HOUSES.findIndex(house => house.id === id);
  
  if (houseIndex === -1) {
    throw new Error('House not found');
  }
  
  HOUSES[houseIndex] = { ...HOUSES[houseIndex], ...updates };
  
  return HOUSES[houseIndex];
};

export const addHouse = async (house: Omit<House, 'id'>) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newHouse: House = {
    ...house,
    id: `house-${Date.now()}`
  };
  
  HOUSES.push(newHouse);
  
  return newHouse;
};

export const deleteHouse = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const houseIndex = HOUSES.findIndex(house => house.id === id);
  
  if (houseIndex === -1) {
    throw new Error('House not found');
  }
  
  HOUSES.splice(houseIndex, 1);
  
  return true;
};
