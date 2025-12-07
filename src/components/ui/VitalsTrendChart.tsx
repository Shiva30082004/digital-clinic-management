import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import PatientVitals from "@/types/PatientVitals";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface Props {
  data: PatientVitals[];
}

export default function VitalsTrendChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 border rounded bg-white shadow">
        <p className="text-gray-500 text-center">No vitals data available</p>
      </div>
    );
  }

  const labels = data.map((d) =>
    new Date(d.consultationTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

 const chartData = {
  labels,
  datasets: [
    {
      label: "Heart Rate (bpm)",
      data: data.map((d) => d.heartRate),
      borderColor: "rgb(255,99,132)",
      backgroundColor: "rgba(255,99,132,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Systolic BP",
      data: data.map((d) => d.systolicBp),
      borderColor: "rgb(54,162,235)",
      backgroundColor: "rgba(54,162,235,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Diastolic BP",
      data: data.map((d) => d.diastolicBp),
      borderColor: "rgb(30,90,200)",
      backgroundColor: "rgba(30,90,200,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Temperature (°F)",
      data: data.map((d) => d.temperature),
      borderColor: "rgb(255,206,86)",
      backgroundColor: "rgba(255,206,86,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Oxygen (%)",
      data: data.map((d) => d.bloodOxygen),
      borderColor: "rgb(75,192,192)",
      backgroundColor: "rgba(75,192,192,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Respiratory Rate",
      data: data.map((d) => d.respiratoryRate),
      borderColor: "rgb(153,102,255)",
      backgroundColor: "rgba(153,102,255,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
    {
      label: "Weight (kg)",
      data: data.map((d) => d.weight),
      borderColor: "rgb(255,159,64)",
      backgroundColor: "rgba(255,159,64,0.2)",
      tension: 0.3,
      spanGaps: true,
    },
  ],
};


  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Patient Vitals Trends</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}