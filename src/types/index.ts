export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  email?: string;
}

export interface Measurement {
  id: string;
  userId: string;
  date: Date;
  weight: number; // in kg
  bodyFatMass: number; // in kg
  bodyFatPercentage: number; // in %
  skeletalMuscleMass: number; // in kg
  bmi: number;
  pbf: number; // Percent Body Fat
  visceralFat: number;
  waterPercentage: number; // in %
  basalMetabolicRate: number; // in kcal
  metabolicAge?: number;
}

export interface MeasurementNorms {
  bodyFatPercentage: {
    male: {
      low: number;
      normal: number;
      high: number;
    };
    female: {
      low: number;
      normal: number;
      high: number;
    };
  };
  bmi: {
    underweight: number;
    normal: number;
    overweight: number;
    obese: number;
  };
  visceralFat: {
    normal: number;
    high: number;
    veryHigh: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }>;
}

export type HealthStatus = 'underweight' | 'normal' | 'overweight' | 'obese' | 'low' | 'high' | 'very-high';

export interface AnalysisResult {
  parameter: string;
  value: number;
  status: HealthStatus;
  normalRange: string;
  recommendation: string;
}