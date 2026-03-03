import { MeatOption } from '../types';

export const MEATS: MeatOption[] = [
  { 
    id: 'chicken', 
    name: 'Pollo a la Parrilla', 
    style: 'from-[#8B4513] via-[#A0522D] to-[#D2691E]', 
    price: 12.50, 
    calories: 380.0,
    protein: 32.8,
    fat: 13.5,
    carbs: 45.2,
    shortName: 'Pollo Parrilla'
  },
  { 
    id: 'beef', 
    name: 'Carne de Res Premium', 
    style: 'from-[#2A1305] via-[#3E1F0A] to-[#5C2E0F]', 
    price: 14.00, 
    calories: 520.0,
    protein: 45.0,
    fat: 28.5,
    carbs: 42.0,
    shortName: 'Res Premium'
  },
  { 
    id: 'fish', 
    name: 'Filete de Pescado', 
    style: 'from-[#DEB887] via-[#F4A460] to-[#E89B53]', 
    price: 11.50, 
    calories: 310.0,
    protein: 24.5,
    fat: 10.2,
    carbs: 48.5,
    shortName: 'Pescado'
  },
  { 
    id: 'crispy', 
    name: 'Pollo Crujiente', 
    style: 'from-[#B8860B] via-[#DAA520] to-[#FFD700]', 
    price: 13.00, 
    calories: 450.0,
    protein: 28.0,
    fat: 22.0,
    carbs: 55.0,
    shortName: 'Pollo Crujiente'
  },
];
