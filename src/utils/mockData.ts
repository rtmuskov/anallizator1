import { User, Measurement } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const mockUser: User = {
  id: '1',
  name: 'Александр Иванов',
  age: 32,
  gender: 'male',
  height: 178,
  email: 'alexander.ivanov@example.com',
};

export const generateMockMeasurements = (userId: string, count = 6): Measurement[] => {
  const measurements: Measurement[] = [];
  const today = new Date();
  
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 5);
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    
    const baseWeight = 82;
    const baseFatPercentage = 24;
    const baseMuscleMass = 35;
    
    const improvement = i * 0.5;
    const randomVariation = (Math.random() - 0.5) * 2;
    
    measurements.push({
      id: uuidv4(),
      userId,
      date,
      weight: parseFloat((baseWeight - improvement + randomVariation).toFixed(1)),
      bodyFatMass: parseFloat(((baseWeight - improvement) * (baseFatPercentage - improvement/2) / 100).toFixed(1)),
      bodyFatPercentage: parseFloat((baseFatPercentage - improvement/2 + randomVariation/2).toFixed(1)),
      skeletalMuscleMass: parseFloat((baseMuscleMass + improvement/3 + randomVariation/3).toFixed(1)),
      bmi: parseFloat(((baseWeight - improvement) / ((mockUser.height/100) * (mockUser.height/100))).toFixed(1)),
      pbf: parseFloat((baseFatPercentage - improvement/2 + randomVariation/2).toFixed(1)),
      visceralFat: Math.max(1, Math.round(10 - improvement/3 + randomVariation/2)),
      waterPercentage: parseFloat((60 + improvement/4 + randomVariation/4).toFixed(1)),
      basalMetabolicRate: Math.round(1700 + improvement*10 + randomVariation*5),
      metabolicAge: Math.max(20, Math.round(34 - improvement + randomVariation)),
    });
  }
  
  return measurements;
};

export const mockMeasurements = generateMockMeasurements(mockUser.id);

export const getLatestMeasurement = (): Measurement => {
  return mockMeasurements[mockMeasurements.length - 1];
};