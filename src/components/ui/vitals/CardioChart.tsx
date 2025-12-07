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

export default function CardioChart({ data }: { data: PatientVitals[] }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-center">No data</div>;
  }

  const labels = data.map(d =>
    new Date(d.consultationTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Systolic BP",
            data: data.map(d => d.systolicBp),
            borderColor: "rgb(54,162,235)",
            backgroundColor: "rgba(54,162,235,0.2)",
            tension: 0.35,
            pointRadius: 4,
            spanGaps: true,
          },
          {
            label: "Diastolic BP",
            data: data.map(d => d.diastolicBp),
            borderColor: "rgb(255,159,64)",
            backgroundColor: "rgba(255,159,64,0.2)",
            tension: 0.35,
            pointRadius: 4,
            spanGaps: true,
          },
          // {
          //   label: "Heart Rate (bpm)",
          //   data: data.map(d => d.heartRate),
          //   borderColor: "rgb(255,99,132)",
          //   backgroundColor: "rgba(255,99,132,0.2)",
          //   tension: 0.35,
          //   pointRadius: 4,
          // },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: false,
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 20,
              font: { size: 11 },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: false,
            grace: "10%",
            ticks: { font: { size: 11 } },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              padding: 12,
              font: { size: 12 },
            },
          },
          tooltip: {
            mode: "nearest",
            intersect: false,
          },
        },
      }}
    />
  );
}
