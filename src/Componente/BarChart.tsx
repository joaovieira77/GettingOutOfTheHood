'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type Props = {
  labels: string[]
  values: number[]
  title?: string
}

export function BarChart({ labels, values, title }: Props) {
  const colors: Record<string, string> = {
    Winter: '#60a5fa',  // blue-400
    Spring: '#34d399',  // green-400
    Summer: '#facc15',  // yellow-400
    Fall:   '#f97316',  // orange-400
  }

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: title || 'Listening Time',
        data: values.map((v) => v / 60000),
        backgroundColor: labels.map((label) => colors[label] || '#780251'), // gray-600 as default
        borderRadius: 12,
        barThickness: 30,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue} min`,
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    scales: {
      y: {
        display: false, // remover o Y axis
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: '#374151', // gray-700
          font: { weight: 'normal' },
        },
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="rounded-lg bg-[#E1E5C8] shadow-md p-4">
      {title && <h3 className="text-center font-semibold mb-2 text-gray-800">{title}</h3>}
      <Bar data={data} options={options} />
    </div>
  )
}
