import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMeasurements } from '../context/MeasurementContext';
import { HealthStatus, AnalysisResult } from '../types';
import { generateAnalysis } from '../utils/healthCalculations';
import HealthMetricCard from '../components/HealthMetricCard';
import MeasurementChart from '../components/MeasurementChart';
import AnalysisResultCard from '../components/AnalysisResultCard';
import { Weight, HeartPulse, Dumbbell, Gauge, Plus, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { measurements, getLatestMeasurement } = useMeasurements();
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  
  const latestMeasurement = getLatestMeasurement();
  const previousMeasurement = measurements.length > 1 
    ? measurements[measurements.length - 2] 
    : undefined;

  useEffect(() => {
    if (user && latestMeasurement) {
      const results = generateAnalysis(latestMeasurement, user);
      setAnalysis(results);
    }
  }, [user, latestMeasurement]);

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
            Последнее измерение: {formatDate(latestMeasurement.date)}
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
          value={latestMeasurement.bodyFatPercentage}
          unit="%"
          status={analysis.find(a => a.parameter.includes('жира'))?.status}
          previousValue={previousMeasurement?.bodyFatPercentage}
          icon={<HeartPulse size={24} />}
        />
        <HealthMetricCard
          title="Мышечная масса"
          value={latestMeasurement.skeletalMuscleMass}
          unit="кг"
          previousValue={previousMeasurement?.skeletalMuscleMass}
          icon={<Dumbbell size={24} />}
        />
        <HealthMetricCard
          title="ИМТ"
          value={latestMeasurement.bmi}
          status={analysis.find(a => a.parameter.includes('ИМТ'))?.status}
          previousValue={previousMeasurement?.bmi}
          icon={<Gauge size={24} />}
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
          measurements={measurements}
          metric="bodyFatPercentage"
          label="Жировая масса (%)"
          color="rgb(239, 68, 68)"
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