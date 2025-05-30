import { Measurement, User, HealthStatus, AnalysisResult } from '../types';

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMIStatus = (bmi: number): HealthStatus => {
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};

export const getBMIRecommendation = (status: HealthStatus): string => {
  switch (status) {
    case 'underweight':
      return 'Рекомендуется увеличить потребление калорий с помощью питательных продуктов и силовых тренировок для набора мышечной массы.';
    case 'normal':
      return 'Поддерживайте текущий здоровый вес через сбалансированное питание и регулярные упражнения.';
    case 'overweight':
      return 'Сосредоточьтесь на умеренном снижении калорий и увеличении физической активности для постепенного снижения веса.';
    case 'obese':
      return 'Проконсультируйтесь с врачом для получения персонализированного плана управления весом. Сфокусируйтесь на устойчивых изменениях образа жизни.';
    default:
      return '';
  }
};

export const getBodyFatStatus = (
  bodyFatPercentage: number,
  gender: 'male' | 'female' | 'other'
): HealthStatus => {
  if (gender === 'male') {
    if (bodyFatPercentage < 8) return 'low';
    if (bodyFatPercentage >= 8 && bodyFatPercentage <= 19) return 'normal';
    return 'high';
  } else {
    if (bodyFatPercentage < 21) return 'low';
    if (bodyFatPercentage >= 21 && bodyFatPercentage <= 33) return 'normal';
    return 'high';
  }
};

export const getBodyFatRecommendation = (status: HealthStatus): string => {
  switch (status) {
    case 'low':
      return 'Процент жира в организме ниже рекомендуемого уровня. Рекомендуется консультация с диетологом для обеспечения достаточного количества необходимого жира.';
    case 'normal':
      return 'Процент жира в организме в пределах нормы. Поддерживайте его через сбалансированное питание и регулярные упражнения.';
    case 'high':
      return 'Рассмотрите возможность увеличения физической активности, особенно силовых тренировок, и пересмотрите свое питание для снижения процента жира.';
    default:
      return '';
  }
};

export const getVisceralFatStatus = (visceralFat: number): HealthStatus => {
  if (visceralFat < 10) return 'normal';
  if (visceralFat >= 10 && visceralFat <= 14) return 'high';
  return 'very-high';
};

export const getVisceralFatRecommendation = (status: HealthStatus): string => {
  switch (status) {
    case 'normal':
      return 'Уровень висцерального жира в норме. Поддерживайте его через регулярные упражнения и сбалансированное питание.';
    case 'high':
      return 'Рассмотрите возможность увеличения кардионагрузок и уменьшения потребления рафинированных углеводов и сахара.';
    case 'very-high':
      return 'Проконсультируйтесь с врачом. Сосредоточьтесь на снижении висцерального жира через регулярные упражнения и изменения в питании.';
    default:
      return '';
  }
};

export const generateAnalysis = (
  measurement: Measurement,
  user: User
): AnalysisResult[] => {
  const analysis: AnalysisResult[] = [];

  const bmiStatus = getBMIStatus(measurement.bmi);
  analysis.push({
    parameter: 'ИМТ (Индекс массы тела)',
    value: measurement.bmi,
    status: bmiStatus,
    normalRange: '18.5 - 24.9',
    recommendation: getBMIRecommendation(bmiStatus),
  });

  const bodyFatStatus = getBodyFatStatus(measurement.bodyFatPercentage, user.gender);
  const normalRangeText =
    user.gender === 'male' ? '8% - 19%' : '21% - 33%';
  
  analysis.push({
    parameter: 'Процент жира в организме',
    value: measurement.bodyFatPercentage,
    status: bodyFatStatus,
    normalRange: normalRangeText,
    recommendation: getBodyFatRecommendation(bodyFatStatus),
  });

  const visceralFatStatus = getVisceralFatStatus(measurement.visceralFat);
  analysis.push({
    parameter: 'Висцеральный жир',
    value: measurement.visceralFat,
    status: visceralFatStatus,
    normalRange: '< 10',
    recommendation: getVisceralFatRecommendation(visceralFatStatus),
  });

  return analysis;
};

export const calculateIdealWeightRange = (height: number): { min: number; max: number } => {
  const heightInMeters = height / 100;
  const minWeight = parseFloat((18.5 * heightInMeters * heightInMeters).toFixed(1));
  const maxWeight = parseFloat((24.9 * heightInMeters * heightInMeters).toFixed(1));
  
  return { min: minWeight, max: maxWeight };
};