import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import PatientVitals from "@/types/PatientVitals";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function OxygenChart({ data }: { data: PatientVitals[] }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-center">No data</div>;
  }

  const labels = data.map((d) =>
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
            label: "Oxygen Saturation (%)",
            data: data.map((d) => d.bloodOxygen),
            borderColor: "rgb(20,184,166)",       // teal
            backgroundColor: "rgba(20,184,166,0.2)",
            pointRadius: 4,
            tension: 0.35,
            spanGaps: true,
          },
          {
            label: "Heart Rate (bpm)",
            data: data.map((d) => d.heartRate),
            borderColor: "rgb(239,68,68)",        // red
            backgroundColor: "rgba(239,68,68,0.2)",
            pointRadius: 4,
            tension: 0.35,
            spanGaps: true,
          },
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
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
            grace: "10%", // Adds breathing room on top
            ticks: {
              font: { size: 11 },
            },
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
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
