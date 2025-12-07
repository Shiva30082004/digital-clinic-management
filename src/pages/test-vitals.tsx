import React from "react";
import CardioChart from "@/components/ui/vitals/CardioChart";
import OxygenChart from "@/components/ui/vitals/OxygenChart";
import BodyMetricsChart from "@/components/ui/vitals/BodyMetricsChart";

//
// MOCK VITALS DATA
//
// Matches your PatientVitals interface EXACTLY:
// {
//   consultationTime: string;
//   heartRate: number | null;
//   respiratoryRate: number | null;
//   temperature: number | null;
//   systolicBp: number | null;
//   diastolicBp: number | null;
//   bloodOxygen: number | null;
//   height: number | null;
//   weight: number | null;
// }
//

const mockVitals = [
  {
    consultationTime: "2025-01-01T10:00:00Z",
    heartRate: 78,
    respiratoryRate: 16,
    temperature: 98.6,
    systolicBp: 120,
    diastolicBp: 80,
    bloodOxygen: 98,
    height: 172,
    weight: 70
  },
  {
    consultationTime: "2025-01-15T10:00:00Z",
    heartRate: 82,
    respiratoryRate: 17,
    temperature: 98.9,
    systolicBp: 124,
    diastolicBp: 82,
    bloodOxygen: 97,
    height: 172,
    weight: 71
  },
  {
    consultationTime: "2025-02-01T10:00:00Z",
    heartRate: 76,
    respiratoryRate: 15,
    temperature: 98.4,
    systolicBp: 118,
    diastolicBp: 79,
    bloodOxygen: 99,
    height: 172,
    weight: 71.5
  },
  {
    consultationTime: "2025-02-20T10:00:00Z",
    heartRate: 88,
    respiratoryRate: 18,
    temperature: 99.1,
    systolicBp: 130,
    diastolicBp: 85,
    bloodOxygen: 96,
    height: 172,
    weight: 72
  },
  {
    consultationTime: "2025-03-05T10:00:00Z",
    heartRate: 90,
    respiratoryRate: 19,
    temperature: 99.3,
    systolicBp: 135,
    diastolicBp: 88,
    bloodOxygen: 95,
    height: 172,
    weight: 73
  }
];

export default function TestVitalsPage() {
  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold text-center mb-8">
        Vitals Charts — Test Mode
      </h1>

      {/* CARDIO CHART */}
      <div className="border rounded-lg p-6 shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Cardiovascular Trends</h2>
        <div className="h-96">
          <CardioChart data={mockVitals} />
        </div>
      </div>

      {/* OXYGEN CHART */}
      <div className="border rounded-lg p-6 shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Oxygen Saturation (SpO₂)</h2>
        <div className="h-80">
          <OxygenChart data={mockVitals} />
        </div>
      </div>

      {/* BODY METRICS */}
      <div className="border rounded-lg p-6 shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Body Measurements</h2>
        <div className="h-96">
          <BodyMetricsChart data={mockVitals} />
        </div>
      </div>

    </div>
  );
}
