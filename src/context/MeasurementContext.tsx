import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Measurement } from '../types';

interface MeasurementContextType {
  measurements: Measurement[];
  addMeasurement: (measurement: Measurement) => void;
  getMeasurementById: (id: string) => Measurement | undefined;
  getLatestMeasurement: () => Measurement | undefined;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export const MeasurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    // Load measurements from localStorage on initial render
    const savedMeasurements = localStorage.getItem('measurements');
    return savedMeasurements ? JSON.parse(savedMeasurements) : [];
  });

  // Save measurements to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('measurements', JSON.stringify(measurements));
  }, [measurements]);

  const addMeasurement = (measurement: Measurement) => {
    setMeasurements((prevMeasurements) => [...prevMeasurements, measurement]);
  };

  const getMeasurementById = (id: string) => {
    return measurements.find((m) => m.id === id);
  };

  const getLatestMeasurement = () => {
    if (measurements.length === 0) return undefined;
    
    // Sort by date and get the most recent
    return [...measurements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  return (
    <MeasurementContext.Provider 
      value={{ 
        measurements, 
        addMeasurement, 
        getMeasurementById, 
        getLatestMeasurement 
      }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurements = (): MeasurementContextType => {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error('useMeasurements должен использоваться внутри MeasurementProvider');
  }
  return context;
};