import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { HealthStatus } from '../types';

interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  status?: HealthStatus;
  previousValue?: number;
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
  const percentChange = previousValue 
    ? parseFloat((((Number(value) - previousValue) / previousValue) * 100).toFixed(1))
    : null;

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
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIndicator = () => {
    if (!percentChange) return null;
    
    if (percentChange > 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowUp size={16} className="mr-1" />
          <span>{Math.abs(percentChange)}%</span>
        </div>
      );
    } else if (percentChange < 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowDown size={16} className="mr-1" />
          <span>{Math.abs(percentChange)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <Minus size={16} className="mr-1" />
          <span>0%</span>
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
              {status === 'normal' ? 'Норма' : 
               status === 'low' || status === 'underweight' ? 'Ниже нормы' :
               status === 'high' || status === 'overweight' ? 'Выше нормы' :
               'Значительно выше нормы'}
            </span>
          )}
        </div>
        
        {percentChange !== null && (
          <div className="text-sm">
            {getTrendIndicator()}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthMetricCard;