import $api from './auth'; // Используем уже настроенный экземпляр axios с интерцепторами

export interface MeasurementData {
  date: string; // Или Date, если вы преобразуете на фронтенде
  weight: number;
  fatMass: number;
  skeletalMuscleMass: number | null; // Изменяем на number | null для соответствия бэкенду
  // Добавляем новые поля измерений здесь
  visceralFat: number | null;
  waterPercentage: number | null;
  basalMetabolicRate: number | null;
  metabolicAge: number | null;
}

export interface Measurement extends MeasurementData {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  // skeletalMuscleMass уже определено в MeasurementData с правильным типом
}

export const measurementAPI = {
  async createMeasurement(data: MeasurementData): Promise<Measurement> {
    const response = await $api.post<Measurement>('/measurement', data);
    return response.data;
  },

  async getAllMeasurements(): Promise<Measurement[]> {
    const response = await $api.get<Measurement[]>('/measurement');
    return response.data;
  },
}; 