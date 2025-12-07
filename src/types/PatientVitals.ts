interface PatientVitals {
  consultationTime: string;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  bloodOxygen: number | null;
  height: number | null;
  weight: number | null;
}

export default PatientVitals;