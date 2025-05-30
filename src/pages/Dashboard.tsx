import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMeasurements } from '../context/MeasurementContext';
import { HealthStatus } from '../types';
import { generateAnalysis, calculateBMI, calculateBodyFatPercentage, AnalysisResult } from '../utils/healthCalculations';
import HealthMetricCard from '../components/HealthMetricCard';
import MeasurementChart from '../components/MeasurementChart';
import AnalysisResultCard from '../components/AnalysisResultCard';
import { Weight, HeartPulse, Dumbbell, Gauge, Plus, Activity, Thermometer, Droplet, Flame, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { measurements, getLatestMeasurement } = useMeasurements();
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  
  const latestMeasurement = getLatestMeasurement();
  const previousMeasurement = measurements.length > 1 
    ? measurements[measurements.length - 2] 
    : undefined;

  const latestFatPercentage = latestMeasurement && latestMeasurement.weight != null && latestMeasurement.fatMass != null
    ? calculateBodyFatPercentage(latestMeasurement.weight, latestMeasurement.fatMass)
    : undefined;
  const latestBMI = latestMeasurement && user?.height != null
    ? calculateBMI(latestMeasurement.weight, user.height)
    : undefined;

  const previousFatPercentage = previousMeasurement && previousMeasurement.weight != null && previousMeasurement.fatMass != null
    ? calculateBodyFatPercentage(previousMeasurement.weight, previousMeasurement.fatMass)
    : undefined;
  const previousBMI = previousMeasurement && user?.height != null
    ? calculateBMI(previousMeasurement.weight, user.height)
    : undefined;

  useEffect(() => {
    if (user && latestMeasurement) {
      const measurementWithCalculated = {
        ...latestMeasurement,
        bmi: latestBMI,
        bodyFatPercentage: latestFatPercentage,
        visceralFat: latestMeasurement.visceralFat ?? 0 as number,
        skeletalMuscleMass: latestMeasurement.skeletalMuscleMass ?? 0 as number,
        waterPercentage: latestMeasurement.waterPercentage ?? 0 as number,
        basalMetabolicRate: latestMeasurement.basalMetabolicRate ?? 0 as number,
        metabolicAge: latestMeasurement.metabolicAge ?? 0 as number,
      };
      const results = generateAnalysis(measurementWithCalculated as any, user as any);
      setAnalysis(results);
    } else {
      setAnalysis([]);
    }
  }, [user, latestMeasurement, measurements]);

  if (!user || !latestMeasurement) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Добро пожаловать в систему анализа InBody
        </h2>
        <p className="text-gray-600 mb-6">
          Измерений не найдено. Давайте начнем с добавления вашего первого измерения.
        </p>
        <Link to="/data-entry" className="btn-primary">
          <Plus className="inline-block mr-2 h-5 w-5" />
          Добавить первое измерение
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Главная панель</h1>
          <p className="text-gray-600 mt-1">
            Последнее измерение: {formatDate(new Date(latestMeasurement.date))}
          </p>
        </div>
        <Link to="/data-entry" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Новое измерение
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ключевые показатели</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <HealthMetricCard
          title="Вес"
          value={latestMeasurement.weight}
          unit="кг"
          previousValue={previousMeasurement?.weight}
          icon={<Weight size={24} />}
        />
        <HealthMetricCard
          title="Жировая масса"
          value={latestFatPercentage ?? 0}
          unit="%"
          status={analysis.find(a => a.parameter.includes('жира'))?.status}
          previousValue={previousFatPercentage ?? 0}
          icon={<HeartPulse size={24} />}
        />
        <HealthMetricCard
          title="Мышечная масса"
          value={latestMeasurement.skeletalMuscleMass ?? 0}
          unit="кг"
          status={analysis.find(a => a.parameter.includes('Мышечная масса'))?.status}
          previousValue={previousMeasurement?.skeletalMuscleMass ?? 0}
          icon={<Dumbbell size={24} />}
        />
        <HealthMetricCard
          title="ИМТ"
          value={latestBMI ?? 0}
          status={analysis.find(a => a.parameter.includes('ИМТ'))?.status}
          previousValue={previousBMI ?? 0}
          icon={<Gauge size={24} />}
        />
        <HealthMetricCard
          title="Висцеральный жир"
          value={latestMeasurement.visceralFat ?? 0}
          status={analysis.find(a => a.parameter.includes('Висцеральный жир'))?.status}
          previousValue={previousMeasurement?.visceralFat ?? 0}
          icon={<Thermometer size={24} />}
        />
        <HealthMetricCard
          title="Вода (%)"
          value={latestMeasurement.waterPercentage ?? 0}
          unit="%"
          status={analysis.find(a => a.parameter.includes('Вода'))?.status}
          previousValue={previousMeasurement?.waterPercentage ?? 0}
          icon={<Droplet size={24} />}
        />
        <HealthMetricCard
          title="Базовый обмен веществ"
          value={latestMeasurement.basalMetabolicRate ?? 0}
          unit="ккал"
          status={analysis.find(a => a.parameter.includes('обмен веществ'))?.status}
          previousValue={previousMeasurement?.basalMetabolicRate ?? 0}
          icon={<Flame size={24} />}
        />
        <HealthMetricCard
          title="Метаболический возраст"
          value={latestMeasurement.metabolicAge ?? 0}
          unit="лет"
          status={analysis.find(a => a.parameter.includes('Метаболический возраст'))?.status}
          previousValue={previousMeasurement?.metabolicAge ?? 0}
          icon={<Clock size={24} />}
        />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Тенденции</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MeasurementChart
          measurements={measurements}
          metric="weight"
          label="Вес (кг)"
          color="rgb(59, 130, 246)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            bodyFatPercentage: m.weight != null && m.fatMass != null
              ? calculateBodyFatPercentage(m.weight, m.fatMass)
              : undefined,
          })) as any}
          metric="bodyFatPercentage"
          label="Жировая масса (%)"
          color="rgb(239, 68, 68)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            skeletalMuscleMass: m.skeletalMuscleMass ?? 0,
          }))}
          metric="skeletalMuscleMass"
          label="Мышечная масса (кг)"
          color="rgb(107, 114, 128)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            visceralFat: m.visceralFat ?? 0,
          }))}
          metric="visceralFat"
          label="Висцеральный жир"
          color="rgb(251, 146, 60)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            waterPercentage: m.waterPercentage ?? 0,
          }))}
          metric="waterPercentage"
          label="Вода (%)"
          color="rgb(96, 165, 250)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            basalMetabolicRate: m.basalMetabolicRate ?? 0,
          }))}
          metric="basalMetabolicRate"
          label="Базовый обмен веществ (ккал)"
          color="rgb(34, 197, 94)"
        />
        <MeasurementChart
          measurements={measurements.map(m => ({
            ...m,
            metabolicAge: m.metabolicAge ?? 0,
          }))}
          metric="metabolicAge"
          label="Метаболический возраст (лет)"
          color="rgb(139, 92, 246)"
        />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Анализ и рекомендации</h2>
      <div className="mb-8">
        {analysis.map((result, index) => (
          <AnalysisResultCard key={index} result={result} />
        ))}
      </div>

      <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
        <h3 className="flex items-center text-lg font-medium text-primary-800 mb-3">
          <Activity className="mr-2 h-5 w-5 text-primary-600" />
          Улучшите своё здоровье
        </h3>
        <p className="text-primary-700 mb-4">
          Отслеживайте свой прогресс и получайте персонализированные рекомендации на основе ваших измерений.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/reports" className="btn-primary">Посмотреть подробные отчёты</Link>
          <Link to="/data-entry" className="btn-outline">Добавить новое измерение</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;