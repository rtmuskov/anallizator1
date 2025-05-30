import React from 'react';
import { AnalysisResult } from '../types';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
          color: 'bg-accent-50 border-accent-200',
          textColor: 'text-accent-800',
          label: 'Норма'
        };
      case 'low':
      case 'underweight':
        return {
          icon: <AlertCircle className="h-6 w-6 text-blue-600" />,
          color: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          label: 'Ниже нормы'
        };
      case 'high':
      case 'overweight':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-warning-500" />,
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          label: 'Выше нормы'
        };
      case 'obese':
      case 'very-high':
        return {
          icon: <XCircle className="h-6 w-6 text-error-500" />,
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          label: 'Значительно выше нормы'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          label: 'Нет данных'
        };
    }
  };

  const { icon, color, textColor, label } = getStatusDisplay(result.status);

  return (
    <div className={`rounded-lg border p-4 mb-4 ${color} animate-fade-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-medium ${textColor}`}>
            {result.parameter}: {result.value}
          </h3>
          
          <div className="mt-2 text-sm">
            <p className={`${textColor} font-medium`}>
              Статус: <span className="capitalize">{label}</span>
            </p>
            <p className={`mt-1 ${textColor}`}>
              Нормальный диапазон: {result.normalRange}
            </p>
            <p className="mt-3 text-gray-700">
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultCard;