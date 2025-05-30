import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Measurement } from '../api/measurement';
import { useUser } from '../context/UserContext';
import { calculateBMI, calculateBodyFatPercentage } from '../utils/healthCalculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MeasurementChartProps {
  measurements: Measurement[];
  metric: keyof Measurement | 'bodyFatPercentage' | 'bmi';
  label: string;
  color?: string;
}

const MeasurementChart: React.FC<MeasurementChartProps> = ({
  measurements,
  metric,
  label,
  color = 'rgb(59, 130, 246)',
}) => {
  const { user } = useUser();

  // Sort measurements by date (oldest to newest)
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Format dates for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare chart data
  const data = {
    labels: sortedMeasurements.map((m) => formatDate(new Date(m.date))),
    datasets: [
      {
        label,
        data: sortedMeasurements.map((m) => {
          if (metric === 'bodyFatPercentage') {
            return m.weight != null && m.fatMass != null ? calculateBodyFatPercentage(m.weight, m.fatMass) : null;
          } else if (metric === 'bmi') {
            return user?.height != null && m.weight != null ? calculateBMI(m.weight, user.height) : null;
          } else {
            const value = m[metric as keyof Measurement];
            return (typeof value === 'number') ? value : null;
          }
        }),
        borderColor: color,
        backgroundColor: `${color}33`, // Add alpha for transparency
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-card">
      <h3 className="text-lg font-medium text-gray-700 mb-4">{label} Over Time</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default MeasurementChart;