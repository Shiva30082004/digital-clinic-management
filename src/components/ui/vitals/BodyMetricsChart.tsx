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

export default function BodyMetricsChart({ data }: { data: PatientVitals[] }) {
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
            label: "Temperature (°F)",
            data: data.map(d => d.temperature),
            borderColor: "rgb(255,206,86)",
            backgroundColor: "rgba(255,206,86,0.2)",
            tension: 0.35,
            pointRadius: 4,
            spanGaps: true,
          },
          {
            label: "Weight (kg)",
            data: data.map(d => d.weight),
            borderColor: "rgba(0, 176, 26, 1)",
            backgroundColor: "rgba(0, 148, 30, 0.2)",
            tension: 0.35,
            pointRadius: 4,
            spanGaps: true,
          },
          {
            label: "Height (cm)",
            data: data.map(d => d.height),
            borderColor: "rgb(75,0,192)",
            backgroundColor: "rgba(75,0,192,0.2)",
            tension: 0.35,
            pointRadius: 4,
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
              font: { size: 11 }
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: false,
            grace: "10%",
            ticks: { font: { size: 11 } },
            grid: { color: "rgba(0,0,0,0.05)" }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: { padding: 12, font: { size: 12 } }
          },
          tooltip: {
            mode: "nearest",
            intersect: false
          }
        }
      }}
    />
  );
}
