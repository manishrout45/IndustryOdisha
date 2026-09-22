import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ViewsChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <p className="text-sm text-ink-muted py-10 text-center">
        No view activity on your posts in this period yet.
      </p>
    );
  }

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Your article views",
        data: data.map((item) => item.views),
        borderColor: "#c62828",
        backgroundColor: "rgba(198, 40, 40, 0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ViewsChart;
