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

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface Props {
  data: {
    consultationTime: string;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    systolicBp: number;
    diastolicBp: number;
    bloodOxygen: number;
    weight: number;
    height: number; 
  }[];
}

export default function VitalsTrendChart({ data }: Props) {
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
      },
      {
        label: "Systolic BP",
        data: data.map((d) => d.systolicBp),
        borderColor: "rgb(54,162,235)",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.3,
      },
      {
        label: "Temperature (°F)",
        data: data.map((d) => d.temperature),
        borderColor: "rgb(255,206,86)",
        backgroundColor: "rgba(255,206,86,0.2)",
        tension: 0.3,
      },
      {
        label: "Oxygen (%)",
        data: data.map((d) => d.bloodOxygen),
        borderColor: "rgb(75,192,192)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <Line data={chartData} />
    </div>
  );
}
