import { Measurement, User, HealthStatus, AnalysisResult } from '../types';
import { Measurement as MeasurementType } from '../api/measurement';

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const calculateBodyFatPercentage = (weight: number, fatMass: number): number => {
  if (weight <= 0) return 0; // Избегаем деления на ноль
  return parseFloat(((fatMass / weight) * 100).toFixed(1));
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

export const getSkeletalMuscleMassStatus = (
  skeletalMuscleMass: number,
  gender: 'male' | 'female' | 'other',
  age: number
): HealthStatus => {
  // Это упрощенные диапазоны, которые могут потребовать уточнения
  if (gender === 'male') {
    if (age < 40) {
      if (skeletalMuscleMass < 20) return 'critically-low'; // Пример критически низкого
      if (skeletalMuscleMass < 24) return 'low';
      if (skeletalMuscleMass >= 24 && skeletalMuscleMass <= 33) return 'normal';
      if (skeletalMuscleMass > 33) return 'high';
      // Можно добавить critically-high при необходимости
      return 'normal';
    } else {
      if (skeletalMuscleMass < 18) return 'critically-low'; // Пример критически низкого
      if (skeletalMuscleMass < 22) return 'low';
      if (skeletalMuscleMass >= 22 && skeletalMuscleMass <= 31) return 'normal';
      if (skeletalMuscleMass > 31) return 'high';
       // Можно добавить critically-high при необходимости
      return 'normal';
    }
  } else { // Female or Other
     if (age < 40) {
      if (skeletalMuscleMass < 11) return 'critically-low'; // Пример критически низкого
      if (skeletalMuscleMass < 15) return 'low';
      if (skeletalMuscleMass >= 15 && skeletalMuscleMass <= 23) return 'normal';
      if (skeletalMuscleMass > 23) return 'high';
       // Можно добавить critically-high при необходимости
      return 'normal';
    } else {
      if (skeletalMuscleMass < 9) return 'critically-low'; // Пример критически низкого
      if (skeletalMuscleMass < 13) return 'low';
      if (skeletalMuscleMass >= 13 && skeletalMuscleMass <= 21) return 'normal';
      if (skeletalMuscleMass > 21) return 'high';
       // Можно добавить critically-high при необходимости
      return 'normal';
    }
  }
};

export const getWaterPercentageStatus = (waterPercentage: number): HealthStatus => {
   // Общие референсные диапазоны
  if (waterPercentage < 45) return 'critically-low'; // Пример критически низкого
  if (waterPercentage < 50) return 'low';
  if (waterPercentage >= 50 && waterPercentage <= 60) return 'normal';
  if (waterPercentage > 65) return 'critically-high'; // Пример критически высокого
  return 'high'; // Выше нормы, но не критически
};

export const getBasalMetabolicRateStatus = (
    basalMetabolicRate: number,
    gender: 'male' | 'female' | 'other',
    age: number,
    weight: number,
    height: number
): HealthStatus => {
    // Примерная формула для БМР (формула Миффлина-Сан Жеора)
    let calculatedBMR = 0;
    if (gender === 'male') {
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else { // Female or Other
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Сравниваем измеренный БМР с расчетным
    // Допуски могут варьироваться, здесь простой пример
    if (basalMetabolicRate < calculatedBMR * 0.8) return 'critically-low'; // Меньше 80% от расчетного
    if (basalMetabolicRate < calculatedBMR * 0.9) return 'low'; // Меньше 90% от расчетного (но больше 80%)
    if (basalMetabolicRate > calculatedBMR * 1.2) return 'critically-high'; // Больше 120% от расчетного
    if (basalMetabolicRate > calculatedBMR * 1.1) return 'high'; // Больше 110% от расчетного (но меньше 120%)
    return 'normal';
};

export const getMetabolicAgeStatus = (metabolicAge: number, age: number): HealthStatus => {
    if (metabolicAge < age - 10) return 'high'; // Значительно моложе (пример)
    if (metabolicAge < age - 5) return 'normal'; // Моложе, но не критически
    // Если метаболический возраст значительно больше фактического, это может быть критически низкий статус здоровья в данном контексте
    if (metabolicAge > age + 5) return 'critically-low'; // Значительно старше (пример критически низкого статуса здоровья)
    if (metabolicAge > age + 2) return 'low'; // Старше, но не критически
    return 'normal'; // В пределах +- 2 лет
};

export const generateAnalysis = (
  measurement: MeasurementType,
  user: User
): AnalysisResult[] => {
  const analysis: AnalysisResult[] = [];

  const bmi = calculateBMI(measurement.weight, user.height);
  const bodyFatPercentage = calculateBodyFatPercentage(measurement.weight, measurement.fatMass);

  const bmiStatus = getBMIStatus(bmi);
  analysis.push({
    parameter: 'ИМТ (Индекс массы тела)',
    value: bmi,
    status: bmiStatus,
    normalRange: '18.5 - 24.9',
    recommendation: getBMIRecommendation(bmiStatus),
  });

  const bodyFatStatus = getBodyFatStatus(bodyFatPercentage, user.gender);
  const normalRangeText =
    user.gender === 'male' ? '8% - 19%' : '21% - 33%';
  
  analysis.push({
    parameter: 'Процент жира в организме',
    value: bodyFatPercentage,
    status: bodyFatStatus,
    normalRange: normalRangeText,
    recommendation: getBodyFatRecommendation(bodyFatStatus),
  });

  const visceralFatStatus = getVisceralFatStatus(measurement.visceralFat ?? 0);
  analysis.push({
    parameter: 'Висцеральный жир',
    value: measurement.visceralFat ?? 0,
    status: visceralFatStatus,
    normalRange: '< 10',
    recommendation: getVisceralFatRecommendation(visceralFatStatus),
  });

  const waterPercentageStatus = getWaterPercentageStatus(measurement.waterPercentage ?? 0);
  analysis.push({
    parameter: 'Процент воды',
    value: measurement.waterPercentage ?? 0,
    status: waterPercentageStatus,
    normalRange: '50% - 60%',
    recommendation: 'Поддерживайте достаточное потребление воды для оптимального здоровья.',
  });

  const basalMetabolicRateStatus = getBasalMetabolicRateStatus(measurement.basalMetabolicRate ?? 0, user.gender, user.age, measurement.weight, user.height);
  analysis.push({
    parameter: 'Базовый обмен веществ',
    value: measurement.basalMetabolicRate ?? 0,
    status: basalMetabolicRateStatus,
    normalRange: 'Зависит от возраста, пола и веса',
    recommendation: 'Регулярные упражнения и сбалансированное питание помогут поддерживать здоровый обмен веществ.',
  });

  const metabolicAgeStatus = getMetabolicAgeStatus(measurement.metabolicAge ?? 0, user.age);
  analysis.push({
    parameter: 'Метаболитический возраст',
    value: measurement.metabolicAge ?? 0,
    status: metabolicAgeStatus,
    normalRange: 'Зависит от возраста',
    recommendation: 'Сосредоточьтесь на здоровом образе жизни для улучшения метаболического возраста.',
  });

  const skeletalMuscleMassStatus = getSkeletalMuscleMassStatus(measurement.skeletalMuscleMass ?? 0, user.gender, user.age);
  analysis.push({
    parameter: 'Мышечная масса',
    value: measurement.skeletalMuscleMass ?? 0,
    status: skeletalMuscleMassStatus,
    normalRange: 'Идеальный диапазон зависит от многих факторов',
    recommendation: 'Регулярные силовые тренировки способствуют росту мышечной массы.',
  });

  return analysis;
};

export const calculateIdealWeightRange = (height: number): { min: number; max: number } => {
  const heightInMeters = height / 100;
  const minWeight = parseFloat((18.5 * heightInMeters * heightInMeters).toFixed(1));
  const maxWeight = parseFloat((24.9 * heightInMeters * heightInMeters).toFixed(1));
  
  return { min: minWeight, max: maxWeight };
};

export type { AnalysisResult };