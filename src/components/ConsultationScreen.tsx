import React, { useEffect, useState } from "react";
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
  ClipboardList,
  AlertTriangle
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

type ConsultationScreenProps = {
  appointment: any;    
  onComplete: () => void;
  onCancel: () => void;
};

type VitalsState = {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
};

type ConsultationState = {
  chiefComplaint: string;
  diagnosis: string;
};

export function ConsultationScreen({
  appointment,
  onComplete,
  onCancel
}: ConsultationScreenProps) {
  const [vitals, setVitals] = useState<VitalsState>({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: ""
  });

  const [consultation, setConsultation] = useState<ConsultationState>({
    chiefComplaint: "",
    diagnosis: ""
  });

  const appointmentId =
    appointment?.AppointmentID ??
    appointment?.appointmentID ??
    appointment?.id ??
    null;

  const appointmentStatus: string | null =
    appointment?.AppointmentStatus ??
    appointment?.status ??
    appointment?.Status ??
    null;

  const isCompletedAppointment =
    appointmentStatus === "COM" || appointmentStatus === "Completed";

  const {
    data: consultationData,
    isLoading,
    isError,
    error,
    refetch,
    invokeRequest
  } = useApiCall<Consultation[] | Consultation>({
    request:
      appointmentId != null
        ? {
            endpoint: "/api/consultation",
            method: "GET",
            params: { appointmentID: appointmentId }
          }
        : undefined,
    fetchOnMount: appointmentId != null
  });

  const { invokeRequest: invokeStatusUpdate } = useApiCall<any>({
    request: undefined,
    fetchOnMount: false
  });

  const currentConsultation: Consultation | null = Array.isArray(consultationData)
    ? consultationData[0] ?? null
    : consultationData ?? null;

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
          : ""
    });

    setConsultation({
      chiefComplaint: currentConsultation.ChiefComplaints ?? "",
      diagnosis: currentConsultation.Diagnosis ?? ""
    });
  }, [currentConsultation]);

  const handleSaveConsultation = async (completeAfterSave: boolean) => {
    if (isCompletedAppointment) {
      console.warn(
        "Attempted to edit consultation for completed appointment. Blocking on frontend."
      );
      return;
    }

    const effectiveAppointmentId =
      currentConsultation?.AppointmentID ?? appointmentId;

    if (!effectiveAppointmentId) return;

    let systolicBP: number | null = null;
    let diastolicBP: number | null = null;
    if (vitals.bloodPressure.includes("/")) {
      const [s, d] = vitals.bloodPressure.split("/");
      systolicBP = Number(s.trim()) || null;
      diastolicBP = Number(d.trim()) || null;
    }

    const hasExisting = !!currentConsultation;

    const payload: any = {
      appointmentID: effectiveAppointmentId,
      heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
      respiratoryRate: currentConsultation?.RespiratoryRate ?? null,
      temperature:
        vitals.temperature !== ""
          ? Number(vitals.temperature)
          : currentConsultation?.Temperature ?? null,
      bloodOxygen: currentConsultation?.BloodOxygen ?? null,
      systolicBP,
      diastolicBP,
      weight:
        vitals.weight !== ""
          ? Number(vitals.weight)
          : currentConsultation?.Weight ?? null,
      height: currentConsultation?.Height ?? null,
      chiefComplaints: consultation.chiefComplaint,
      diagnosis: consultation.diagnosis
    };

    if (hasExisting) {
      payload.consultationID = currentConsultation!.ConsultationID;
    }

    try {
      await invokeRequest({
        endpoint: "/api/consultation",
        method: hasExisting ? "PUT" : "POST",
        payload
      });

      if (completeAfterSave) {
        await invokeStatusUpdate({
          endpoint: "/api/appointments/status",
          method: "PUT",
          payload: {
            appointmentID: effectiveAppointmentId,
            status: "COM"
          }
        });
      }

      await refetch();

      if (completeAfterSave) {
        onComplete && onComplete();
      }
    } catch (e) {
      console.error("Failed to save consultation", e);
    }
  };

  if (!appointment || (isLoading && !currentConsultation)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading consultation...</div>
      </div>
    );
  }

  if (isError && !currentConsultation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <div className="text-red-500">Failed to load consultation.</div>
        {error && <div className="text-slate-500 text-sm">{error}</div>}
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const disableEditing = isCompletedAppointment || isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Consultation Session
          </h1>
          <p className="text-slate-600">
            {appointment.patient ?? appointment.PatientName ?? "Patient"}{" "}
            - {appointment.type ?? appointment.Type ?? ""}
          </p>
          {appointmentStatus && (
            <div className="mt-1">
              <Badge
                variant={isCompletedAppointment ? "destructive" : "outline"}
                className="text-xs"
              >
                Status: {appointmentStatus}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleSaveConsultation(true)}
            disabled={disableEditing}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* Completed */}
      {isCompletedAppointment && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="py-3 flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              This appointment is{" "}
              <span className="font-semibold">completed (COM)</span>. Consultation
              details are read-only and cannot be edited.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Patient & Appointment Info */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Patient</p>
                <p className="font-semibold text-slate-900">
                  {appointment.patient ?? appointment.PatientName ?? "Patient"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">
                  {appointment.time ?? appointment.Time ?? "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-semibold text-slate-900">
                  {appointment.type ?? appointment.Type ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Label htmlFor="bp" className="flex items-center text-slate-700">
                    <Activity className="mr-2 h-4 w-4 text-red-500" />
                    Blood Pressure
                  </Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={vitals.bloodPressure}
                    onChange={(e) =>
                      setVitals({ ...vitals, bloodPressure: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hr" className="flex items-center text-slate-700">
                    <Heart className="mr-2 h-4 w-4 text-pink-500" />
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="hr"
                    placeholder="72"
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) =>
                      setVitals({ ...vitals, heartRate: e.target.value })
                    }
                    disabled={disableEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp" className="flex items-center text-slate-700">
                    <Thermometer className="mr-2 h-4 w-4 text-orange-500" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temp"
                    placeholder="36.7"
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
                    htmlFor="weight"
                    className="flex items-center text-slate-700"
                  >
                    <Weight className="mr-2 h-4 w-4 text-blue-500" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    placeholder="70"
                    type="number"
                    value={vitals.weight}
                    onChange={(e) =>
                      setVitals({ ...vitals, weight: e.target.value })
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
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      diagnosis: e.target.value
                    })
                  }
                  disabled={disableEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View Previous Records
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                View Vital History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Patient Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Recent Vitals</CardTitle>
              <CardDescription>Last recorded values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Blood Pressure</span>
                <Badge variant="outline" className="font-mono">
                  {vitals.bloodPressure || "—"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Weight</span>
                <Badge variant="outline" className="font-mono">
                  {vitals.weight ? `${vitals.weight} kg` : "—"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Heart Rate</span>
                <Badge variant="outline" className="font-mono">
                  {vitals.heartRate ? `${vitals.heartRate} bpm` : "—"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Prescription
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSaveConsultation(false)}
                disabled={disableEditing}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSaveConsultation(true)}
              disabled={disableEditing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete &amp; Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}