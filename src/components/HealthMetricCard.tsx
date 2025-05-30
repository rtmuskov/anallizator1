import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { HealthStatus } from '../types';

interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  status?: HealthStatus;
  previousValue?: number | null;
  icon?: React.ReactNode;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit = '',
  status,
  previousValue,
  icon,
}) => {
  const numericValue = Number(value);

  const getStatusColor = (status: HealthStatus | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'low':
      case 'underweight':
        return 'bg-blue-100 text-blue-800';
      case 'high':
      case 'overweight':
        return 'bg-yellow-100 text-yellow-800';
      case 'obese':
      case 'very-high':
      case 'critically-low':
      case 'critically-high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: HealthStatus): string => {
    switch (status) {
      case 'normal': return 'Норма';
      case 'low': return 'Ниже нормы';
      case 'critically-low': return 'Критически ниже нормы';
      case 'underweight': return 'Недостаточный вес';
      case 'high': return 'Выше нормы';
      case 'critically-high': return 'Критически выше нормы';
      case 'overweight': return 'Избыточный вес';
      case 'obese': return 'Ожирение';
      case 'very-high': return 'Очень высокий'; // Можно уточнить текст
      default: return '';
    }
  };

  const getTrendIndicator = () => {
    if (previousValue == null) return null;

    const delta = numericValue - previousValue;

    const percentChange = previousValue !== 0
      ? parseFloat(((delta / previousValue) * 100).toFixed(1))
      : (delta !== 0) ? null : 0;

    if (delta > 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowUp size={16} className="mr-1" />
          <span>{percentChange !== null ? `${Math.abs(percentChange)}%` : `+${delta.toFixed(1)}${unit}`}</span>
        </div>
      );
    } else if (delta < 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowDown size={16} className="mr-1" />
          <span>{percentChange !== null ? `${Math.abs(percentChange)}%` : `${delta.toFixed(1)}${unit}`}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <Minus size={16} className="mr-1" />
          <span>0{unit}</span>
        </div>
      );
    }
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        {icon && <div className="text-primary-500">{icon}</div>}
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-semibold">
            {value}
            {unit && <span className="text-lg ml-1 font-normal text-gray-500">{unit}</span>}
          </div>
          
          {status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
          )}
        </div>
        
        {getTrendIndicator()}
      </div>
    </div>
  );
};

export default HealthMetricCard;