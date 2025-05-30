import React, { useState } from 'react';
import { useMeasurements } from '../context/MeasurementContext';
import { useUser } from '../context/UserContext';
import MeasurementChart from '../components/MeasurementChart';
import { Measurement } from '../api/measurement';
import { calculateIdealWeightRange, calculateBMI, calculateBodyFatPercentage } from '../utils/healthCalculations';
import { FileText, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports: React.FC = () => {
  const { measurements } = useMeasurements();
  const { user } = useUser();
  const [selectedMetric, setSelectedMetric] = useState<keyof Measurement>('weight');
  
  if (!user || measurements.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Нет доступных данных
        </h2>
        <p className="text-gray-600 mb-6">
          Пожалуйста, добавьте измерения для просмотра отчетов.
        </p>
      </div>
    );
  }

  // Get all available dates for measurements
  const measurementDates = measurements.map(m => new Date(m.date));
  
  // Sort dates in descending order (newest first)
  measurementDates.sort((a, b) => b.getTime() - a.getTime());
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get ideal weight range based on user's height
  const idealWeightRange = calculateIdealWeightRange(user.height);

  // Available metrics for selection
  const metricOptions = [
    { value: 'weight', label: 'Вес (кг)', color: 'rgb(59, 130, 246)' },
    { value: 'bodyFatPercentage', label: 'Жировая масса (%)', color: 'rgb(239, 68, 68)' },
    { value: 'skeletalMuscleMass', label: 'Мышечная масса (кг)', color: 'rgb(34, 197, 94)' },
    { value: 'bmi', label: 'ИМТ', color: 'rgb(168, 85, 247)' },
    { value: 'visceralFat', label: 'Висцеральный жир', color: 'rgb(245, 158, 11)' },
    { value: 'waterPercentage', label: 'Вода (%)', color: 'rgb(20, 184, 166)' },
    { value: 'basalMetabolicRate', label: 'Базовый обмен веществ (ккал)', color: 'rgb(251, 146, 60)' },
    { value: 'metabolicAge', label: 'Метаболический возраст (лет)', color: 'rgb(129, 140, 248)' },
  ];

  // Find selected metric details
  const selectedMetricDetails = metricOptions.find(option => option.value === selectedMetric);

  const handleExportCSV = () => {
    if (measurements.length === 0) {
      alert('Нет данных для экспорта.');
      return;
    }

    const csvHeader = ['Дата', 'Вес (кг)', 'Жировая масса (%)', 'Мышечная масса (кг)', 'ИМТ', 'Висцеральный жир', 'Вода (%)', 'Базовый обмен веществ (ккал)', 'Метаболический возраст (лет)'].join(',');
    
    const csvRows = measurements.map(m => {
      const date = new Date(m.date).toLocaleDateString('ru-RU'); // Use Russian date format for CSV
      const bmi = user?.height ? calculateBMI(m.weight, user.height) : ''; // Рассчитываем ИМТ
      const bodyFatPercentage = m.weight != null && m.fatMass != null ? calculateBodyFatPercentage(m.weight, m.fatMass) : ''; // Рассчитываем процент жира

      return [
        `"${date}"`,
        `"${m.weight || ''}"`,
        `"${bodyFatPercentage}"`,
        `"${m.skeletalMuscleMass || ''}"`,
        `"${bmi}"`,
        `"${m.visceralFat || ''}"`,
        `"${m.waterPercentage || ''}"`,
        `"${m.basalMetabolicRate || ''}"`,
        `"${m.metabolicAge || ''}"`,
      ].join(',');
    });

    const csvString = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'inbody_measurements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDF = () => {
    const input = document.getElementById('report-content'); // Assume there's an element with id 'report-content' wrapping the report
    if (input) {
      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('inbody_report.pdf');
        })
        .catch((err) => {
          console.error('Ошибка при создании PDF:', err);
          alert('Не удалось создать PDF отчет.');
        });
    } else {
      alert('Не удалось найти содержимое отчета для экспорта в PDF.');
    }
  };

  return (
    <div className="animate-slide-up">
      <div id="report-content">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Отчеты и анализ</h1>
          <p className="text-gray-600 mt-1">
              Просмотр вашего прогресса и тенденций с течением времени
          </p>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary-600" />
            Выберите показатель для визуализации
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricOptions.map(option => (
            <button
              key={option.value}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none ${
                selectedMetric === option.value
                  ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
              onClick={() => setSelectedMetric(option.value as keyof Measurement)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="mb-8">
        {selectedMetricDetails && (
          <MeasurementChart
            measurements={measurements}
            metric={selectedMetric}
            label={selectedMetricDetails.label}
            color={selectedMetricDetails.color}
          />
        )}
      </div>

      {/* Measurement History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary-600" />
                История измерений
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Вес (кг)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Жировая масса (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Мышечная масса (кг)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ИМТ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Висцеральный жир
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Вода (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Базовый обмен веществ (ккал)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Метаболический возраст (лет)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...measurements]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((measurement) => {
                      const bmi = user?.height ? calculateBMI(measurement.weight, user.height) : undefined; // Рассчитываем ИМТ для отображения
                      const bodyFatPercentage = measurement.weight != null && measurement.fatMass != null ? calculateBodyFatPercentage(measurement.weight, measurement.fatMass) : undefined; // Рассчитываем процент жира для отображения

                      return (
                        <tr key={measurement.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(new Date(measurement.date))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.weight}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bodyFatPercentage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.skeletalMuscleMass}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bmi}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.visceralFat}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.waterPercentage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.basalMetabolicRate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.metabolicAge}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-600" />
                Информация о здоровье
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Идеальный диапазон веса</h3>
                <p className="text-gray-700">
                    На основе вашего роста ({user.height} см), ваш идеальный диапазон веса составляет от {idealWeightRange.min} до {idealWeightRange.max} кг.
                </p>
              </div>
              
              <div className="border-l-4 border-secondary-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Классификация ИМТ</h3>
                <p className="text-gray-700">
                    <span className="block mb-1">Категории ИМТ:</span>
                    <span className="block text-sm">Менее 18.5: Недостаточный вес</span>
                    <span className="block text-sm">18.5-24.9: Нормальный вес</span>
                    <span className="block text-sm">25-29.9: Избыточный вес</span>
                    <span className="block text-sm">30 и выше: Ожирение</span>
                </p>
              </div>
              
              <div className="border-l-4 border-accent-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Процент жира</h3>
                <p className="text-gray-700">
                    Показатель процента жира важен для оценки общего состояния здоровья и композиции тела. Различные уровни процента жира могут указывать на различные риски для здоровья.
                </p>
              </div>
              <div className="border-l-4 border-warning-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Висцеральный жир</h3>
                <p className="text-gray-700">
                    Висцеральный жир окружает внутренние органы и связан с повышенным риском хронических заболеваний. Его уровень является важным показателем здоровья.
                </p>
              </div>
              <div className="border-l-4 border-info-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Вода в организме</h3>
                <p className="text-gray-700">
                    Общая вода в организме является ключевым показателем гидратации. Недостаток воды может влиять на многие функции организма.
                </p>
              </div>
              <div className="border-l-4 border-success-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Базовый обмен веществ (BMR)</h3>
                <p className="text-gray-700">
                    BMR - это количество калорий, которое ваш организм сжигает в состоянии покоя для поддержания основных жизненных функций.
                </p>
              </div>
              <div className="border-l-4 border-danger-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">Метаболический возраст</h3>
                <p className="text-gray-700">
                    Метаболический возраст сравнивает ваш BMR с BMR других людей вашей хронологической возрастной группы. Более низкий метаболический возраст обычно указывает на лучшее здоровье.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
        <h3 className="flex items-center text-lg font-medium text-primary-800 mb-3">
          <FileText className="mr-2 h-5 w-5 text-primary-600" />
            Экспорт данных
        </h3>
        <p className="text-primary-700 mb-4">
            Скачайте историю измерений или создайте подробные отчеты о здоровье.
        </p>
        <div className="flex flex-wrap gap-4">
            <button className="btn-primary flex items-center" onClick={handleExportCSV}>
              Экспорт в CSV
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
            <button className="btn-outline flex items-center" onClick={handleGeneratePDF}>
              Создать PDF отчет
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;