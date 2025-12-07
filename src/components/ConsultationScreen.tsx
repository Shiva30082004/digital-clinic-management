import React, { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import type Consultation from "@/types/Consultation";

import {
  X,
  Save,
  CheckCircle,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Clock,
  User,
  FileText,
  Stethoscope,
  Pill,
  ClipboardList,
  Ruler,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import ProcedureSearch from "@/components/ui/ProcedureSearch";
import type { Procedure } from "@/types/Procedure";
import useGeneratePrescription from "@/hooks/useGeneratePrescription";

type ConsultationScreenProps = {
  appointment: {
    appointmentID: number;
    appointmentStatus: string;
    startTime: string;
    endTime: string | null;
    patientID: number;
    doctorID: number;
  };
  onComplete: () => void;
  onCancel: () => void;
};

type ConsultationWithProcedures = Consultation & {
  procedures?: Procedure[];
};

export function ConsultationScreen({
  appointmentId,
  onComplete,
  onCancel,
  onPatientSelect
}: ConsultationScreenProps) {
  const { data = {} } = useApiCall({
    request: {
      endpoint: "/api/appointments",
      params: { id: appointmentId },
      method: "GET"
    },
    fetchOnMount: true
  });

  const { appointmentStatus = "", patientID = "", startTime = "" } = data || {};
  const isCompletedAppointment = appointmentStatus === "COM";
  const isLockedAppointment = appointmentStatus === "CAN";

  const { data: patient = {} } = useApiCall({
    request: {
      endpoint: "/api/patient",
      params: {
        id: patientID
      }
    },
    fetchOnMount: !!patientID
  });

  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    bloodOxygen: ""
  });

  const [consultation, setConsultation] = useState({
    chiefComplaint: "",
    symptoms: "",
    examination: "",
    diagnosis: "",
    treatment: "",
    prescription: ""
  });

  const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);

  const handleProcedureSelect = (proc: Procedure) => {
    setSelectedProcedures((prev) => [...prev, proc]);
  };

  const handleRemoveProcedure = (procedureId: number) => {
    setSelectedProcedures((prev) =>
      prev.filter((p) => p.procedureId !== procedureId)
    );
  };

  const {
    data: consultationData,
    isLoading,
    invokeRequest,
    refetch
  } = useApiCall<ConsultationWithProcedures>({
    request: {
      endpoint: "/api/consultation",
      method: "GET",
      params: { appointmentID: appointmentId }
    },
    fetchOnMount: !!appointmentId
  });

  const currentConsultation = consultationData ?? null;

  const { invokeRequest: invokeStatusUpdate } = useApiCall({
    request: {
      endpoint: "/api/appointments/status",
      method: "PATCH"
    },
    fetchOnMount: false
  });

  const { isGeneratingPrescription = false, invokeGeneratePrescription } =
    useGeneratePrescription();

  const handleGeneratePrescription = async () => {
    invokeGeneratePrescription(appointmentId);
  };

  useEffect(() => {
    if (!currentConsultation) return;

    setVitals({
      bloodPressure:
        currentConsultation.SystolicBP != null &&
        currentConsultation.DiastolicBP != null
          ? `${currentConsultation.SystolicBP}/${currentConsultation.DiastolicBP}`
          : "",
      heartRate:
        currentConsultation.HeartRate != null
          ? String(currentConsultation.HeartRate)
          : "",
      temperature:
        currentConsultation.Temperature != null
          ? String(currentConsultation.Temperature)
          : "",
      weight:
        currentConsultation.Weight != null
          ? String(currentConsultation.Weight)
          : "",
      height:
        currentConsultation.Height != null
          ? String(currentConsultation.Height)
          : "",
      bloodOxygen:
        currentConsultation.BloodOxygen != null
          ? String(currentConsultation.BloodOxygen)
          : ""
    });

    setConsultation((prev) => ({
      ...prev,
      chiefComplaint: currentConsultation.ChiefComplaints ?? "",
      diagnosis: currentConsultation.Diagnosis ?? ""
    }));

    setSelectedProcedures(currentConsultation.procedures ?? []);
  }, [currentConsultation]);

  const disableEditing =
    isCompletedAppointment || isLockedAppointment || isLoading;

  const handleSaveConsultation = async (completeAfterSave: boolean) => {
    console.log(
      ">>> handleSaveConsultation called, completeAfterSave =",
      completeAfterSave
    );

    if (isCompletedAppointment) {
      console.warn("Completed appointment, editing blocked on frontend");
      return;
    }

    if (isLockedAppointment) {
      console.warn("cancelled appointment, editing blocked on frontend");
      return;
    }

    if (!appointmentId) {
      console.warn("No appointmentId, cannot save consultation");
      return;
    }

    let systolicBP: number | null = null;
    let diastolicBP: number | null = null;
    if (vitals.bloodPressure && vitals.bloodPressure.includes("/")) {
      const [s, d] = vitals.bloodPressure.split("/");
      systolicBP = Number(s.trim()) || null;
      diastolicBP = Number(d.trim()) || null;
    }

    const hasExisting =
      !!currentConsultation &&
      (currentConsultation as any).ConsultationID != null;

    const payload = {
      appointmentID: appointmentId,
      heartRate: vitals.heartRate
        ? Number(vitals.heartRate)
        : currentConsultation?.HeartRate ?? null,
      respiratoryRate: currentConsultation?.RespiratoryRate ?? null,
      temperature: vitals.temperature
        ? Number(vitals.temperature)
        : currentConsultation?.Temperature ?? null,
      bloodOxygen: vitals.bloodOxygen
        ? Number(vitals.bloodOxygen)
        : currentConsultation?.BloodOxygen ?? null,
      systolicBP,
      diastolicBP,
      weight: vitals.weight
        ? Number(vitals.weight)
        : currentConsultation?.Weight ?? null,
      height: vitals.height
        ? Number(vitals.height)
        : currentConsultation?.Height ?? null,
      chiefComplaints: consultation.chiefComplaint,
      diagnosis: consultation.diagnosis,
      procedures: selectedProcedures.map((p) => p.procedureId)
    };

    try {
      console.log(">>> Saving consultation, hasExisting =", hasExisting);
      await invokeRequest({
        endpoint: "/api/consultation",
        method: hasExisting ? "PUT" : "POST",
        payload
      });

      await refetch();

      if (completeAfterSave) {
        try {
          console.log(
            ">>> Calling status PATCH via invokeStatusUpdate, id =",
            appointmentId
          );

          const res = await invokeStatusUpdate({
            endpoint: "/api/appointments/status",
            params: { id: appointmentId },
            payload: { appointmentStatus: "COM" },
            method: "PATCH"
          });

          console.log(">>> Status PATCH result:", res);
        } catch (e) {
          console.error(">>> Status update failed:", e);
        }
      }

      if (completeAfterSave) {
        await invokeGeneratePrescription(appointmentId);
        onComplete && onComplete();
      }
    } catch (e) {
      console.error(">>> Failed to save consultation", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading consultation...</div>
      </div>
    );
  }

  if (isGeneratingPrescription) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Generating prescription...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Consultation Session
          </h1>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleSaveConsultation(true)}
            disabled={disableEditing}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* Patient & Appointment Info */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Patient</p>
                <p className="font-semibold text-slate-900">
                  {patient?.firstName || ""} {patient?.lastName || ""}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">
                  {new Date(startTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onPatientSelect(patientID)}>
                <User className="mr-2 h-4 w-4" />
                View Patient Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-red-600" />
                Vital Signs
              </CardTitle>
              <CardDescription>
                Record patient vitals for this consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="weight"
                    className="flex items-center text-slate-700">
                    <Weight className="mr-2 h-4 w-4 text-purple-600" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={vitals.weight}
                    onChange={(e) =>
                      setVitals({ ...vitals, weight: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="height"
                    className="flex items-center text-slate-700">
                    <Ruler className="mr-2 h-4 w-4 text-blue-500" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={vitals.height}
                    onChange={(e) =>
                      setVitals({ ...vitals, height: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="temp"
                    className="flex items-center text-slate-700">
                    <Thermometer className="mr-2 h-4 w-4 text-orange-500" />
                    Temperature (°F)
                  </Label>
                  <Input
                    id="temp"
                    type="number"
                    value={vitals.temperature}
                    onChange={(e) =>
                      setVitals({ ...vitals, temperature: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="bp"
                    className="flex items-center text-slate-700">
                    <Activity className="mr-2 h-4 w-4 text-red-500" />
                    Blood Pressure
                  </Label>
                  <Input
                    id="bp"
                    value={vitals.bloodPressure}
                    onChange={(e) =>
                      setVitals({ ...vitals, bloodPressure: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hr"
                    className="flex items-center text-slate-700">
                    <Heart className="mr-2 h-4 w-4 text-pink-500" />
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="hr"
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) =>
                      setVitals({ ...vitals, heartRate: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="spo2"
                    className="flex items-center text-slate-700">
                    <Gauge className="mr-2 h-4 w-4 text-pink-500" />
                    SpO2 (%)
                  </Label>
                  <Input
                    id="spo2"
                    type="number"
                    value={vitals.bloodOxygen}
                    onChange={(e) =>
                      setVitals({ ...vitals, bloodOxygen: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Notes */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5 text-blue-600" />
                Consultation Details
              </CardTitle>
              <CardDescription>
                Record chief complaints and diagnosis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complaints" className="text-slate-700">
                  Chief Complaints
                </Label>
                <Textarea
                  id="complaints"
                  placeholder="Describe the main complaints and symptoms..."
                  className="min-h-[120px] resize-none"
                  value={consultation.chiefComplaint}
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      chiefComplaint: e.target.value
                    })
                  }
                  disabled={disableEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-slate-700">
                  Diagnosis
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Clinical diagnosis..."
                  className="min-h-[120px] resize-none"
                  value={consultation.diagnosis}
                  disabled={disableEditing}
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      diagnosis: e.target.value
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Procedures */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="mr-2 h-5 w-5 text-emerald-600" />
                Procedures Performed
              </CardTitle>
              <CardDescription>
                Search and add procedures performed during this consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!disableEditing && (
                <ProcedureSearch onSelect={handleProcedureSelect} />
              )}

              {selectedProcedures.length > 0 && (
                <div className="space-y-2">
                  {selectedProcedures.map((p) => (
                    <div
                      key={p.procedureId}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                      <span>{p.procedureName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">
                          ${p.amount}
                        </span>
                        {!disableEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveProcedure(p.procedureId)
                            }>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleGeneratePrescription}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Prescription
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSaveConsultation(false)}
                disabled={disableEditing}>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSaveConsultation(true)}
              disabled={disableEditing}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete &amp; Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
