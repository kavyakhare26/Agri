import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Card, Row, Col } from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SoilBarChart({ reading }) {
  if (!reading) return <div className="text-muted p-3">No reading available</div>;

  const data = {
    labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Moisture (%)'],
    datasets: [
      {
        label: 'Current Reading',
        data: [reading.N || 0, reading.P || 0, reading.K || 0, reading.moisture || 0],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',
          'rgba(23, 162, 184, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(0, 123, 255, 0.7)',
        ],
        borderColor: [
          '#28a745',
          '#17a2b8',
          '#ffc107',
          '#007bff',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Latest N-P-K & Moisture Profile' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}

export function SoilHistoryChart({ readings }) {
  if (!readings || readings.length === 0) {
    return <div className="text-muted p-3">No history available</div>;
  }

  // Reverse so chronological left to right
  const chronological = [...readings].reverse();

  const labels = chronological.map((r) =>
    r.recordedAt ? new Date(r.recordedAt).toLocaleDateString() : 'Log'
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'pH Level',
        data: chronological.map((r) => r.pH || 0),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Moisture (%)',
        data: chronological.map((r) => r.moisture || 0),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'pH & Moisture Trends Over Time' },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 14,
        title: { display: true, text: 'pH (0-14)' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Moisture %' },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default { SoilBarChart, SoilHistoryChart };

