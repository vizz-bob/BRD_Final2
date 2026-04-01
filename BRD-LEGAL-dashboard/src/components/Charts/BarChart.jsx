import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false, text: 'Bar Chart' },
    },
  };

  return (
    <div className="relative w-full" style={{ height: 'clamp(180px, 40vw, 384px)' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;