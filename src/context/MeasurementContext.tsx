import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Measurement, MeasurementData, measurementAPI } from '../api/measurement';
import { useAuth } from './AuthContext';

interface MeasurementContextType {
  measurements: Measurement[];
  addMeasurement: (measurementData: MeasurementData) => Promise<void>;
  getMeasurementById: (id: number) => Measurement | undefined;
  getLatestMeasurement: () => Measurement | undefined;
  isLoadingMeasurements: boolean;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export const MeasurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(true);
  const { isAuth, isLoading: isLoadingAuth } = useAuth();

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!isAuth) {
        setMeasurements([]);
        setIsLoadingMeasurements(false);
        return;
      }
      setIsLoadingMeasurements(true);
      try {
        const data = await measurementAPI.getAllMeasurements();
        setMeasurements(data);
      } catch (e) {
        console.error('Ошибка при загрузке измерений:', e);
        setMeasurements([]);
      } finally {
        setIsLoadingMeasurements(false);
      }
    };

    if (!isLoadingAuth) {
        fetchMeasurements();
    }

  }, [isAuth, isLoadingAuth]);

  const addMeasurement = async (measurementData: MeasurementData) => {
    try {
        await measurementAPI.createMeasurement(measurementData);
        const updatedMeasurements = await measurementAPI.getAllMeasurements();
        setMeasurements(updatedMeasurements);
    } catch (e) {
        console.error('Ошибка при добавлении измерения:', e);
        throw e;
    }
  };

  const getMeasurementById = (id: number) => {
    return measurements.find((m) => m.id === id);
  };

  const getLatestMeasurement = () => {
    if (measurements.length === 0) return undefined;
    
    return [...measurements].sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return b.id - a.id;
    })[0];
  };

  return (
    <MeasurementContext.Provider 
      value={{ 
        measurements, 
        addMeasurement, 
        getMeasurementById, 
        getLatestMeasurement, 
        isLoadingMeasurements,
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