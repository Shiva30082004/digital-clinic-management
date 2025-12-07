import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  User,
  Mail,
  Calendar,
  Activity,
  Heart,
  FileText,
  Eye,
  Clock,
  X,
  Edit,
  Save,
  CheckCircle,
  CircleDashed,
  MoreVertical,
  CircleGauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import PatientVitals from "@/types/PatientVitals";
import useApiCall from "@/hooks/useApiCall";
import Appointment from "@/types/Appointment";

import CardioChart from "@/components/ui/vitals/CardioChart";
import OxygenChart from "@/components/ui/vitals/OxygenChart";
import BodyMetricsChart from "@/components/ui/vitals/BodyMetricsChart";

function average(arr: number[]) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function isValidVital(v: any) {
  if (v === null || v === undefined) return false;
  if (v === "") return false;
  const num = Number(v);
  if (Number.isNaN(num)) return false;
  if (num <= 0) return false; // vitals can't realistically be 0
  return true;
}

function groupVitalsByDate(vitals: any[]) {
  const map: Record<string, any[]> = {};

  for (const v of vitals) {
    const date = new Date(v.consultationTime).toISOString().split("T")[0];
    if (!map[date]) map[date] = [];
    map[date].push(v);
  }

  return Object.keys(map)
    .sort()
    .map((date) => {
      const list = map[date];

      const safe = (values: any[]) =>
        average(values.filter(isValidVital).map(Number));

      return {
        consultationTime: date,
        temperature: safe(list.map((v) => v.temperature)),
        weight: safe(list.map((v) => v.weight)),
        height: safe(list.map((v) => v.height)),
        systolicBp: safe(list.map((v) => v.systolicBp)),
        diastolicBp: safe(list.map((v) => v.diastolicBp)),
        heartRate: safe(list.map((v) => v.heartRate)),
        bloodOxygen: safe(list.map((v) => v.bloodOxygen)),
        respiratoryRate: safe(list.map((v) => v.respiratoryRate))
      };
    });
}

export function PatientProfile({
  patientId,
  onBack,
  onStartConsultation,
  doctorInfo
}) {
  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments
  } = useApiCall<Appointment[]>({
    request: {
      endpoint: "/api/appointments/byPatient",
      method: "GET",
      params: {
        patientId
      }
    },
    fetchOnMount: !!patientId
  });
  const { invokeRequest: updateAppointmentRequest } = useApiCall();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    status: "Booked"
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedPatient, setEditedPatient] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    dateOfBirth: "",
    gender: ""
  });

  const isOwnAppointment = (appointment: any) => {
    return appointment.doctorID === doctorInfo?.doctorId;
  };

  const isAdmin = doctorInfo?.role === "admin";

  // Convert API status codes to display format
  const convertStatusToDisplay = (apiStatus: string) => {
    const statusMap: { [key: string]: string } = {
      BKD: "Booked",
      ACT: "Active",
      COM: "Completed",
      CAN: "Cancelled"
    };
    return statusMap[apiStatus] || apiStatus;
  };

  // Convert display status to API format
  const convertStatusToApi = (displayStatus: string) => {
    const statusMap: { [key: string]: string } = {
      Booked: "BKD",
      Active: "ACT",
      Completed: "COM",
      Cancelled: "CAN"
    };
    return statusMap[displayStatus] || displayStatus;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "active":
        return <Activity className="h-4 w-4" />;
      default:
        return <CircleDashed className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = async (
    appointmentId: number,
    newStatus: string
  ) => {
    try {
      await updateAppointmentRequest({
        endpoint: "/api/appointments",
        method: "PUT",
        payload: {
          appointmentID: appointmentId,
          appointmentStatus: convertStatusToApi(newStatus)
        }
      });
      console.log("Appointment status updated:", appointmentId, newStatus);
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const handleScheduleAppointment = async () => {
    const startDateTime = `${newAppointment.date}T${newAppointment.startTime}:00`;
    const endDateTime = `${newAppointment.date}T${newAppointment.endTime}:00`;

    // Call API to create appointment
    await updateAppointmentRequest({
      endpoint: "/api/appointments",
      method: "POST",
      payload: {
        patientID: patientId,
        appointmentStatus: "BKD", // Always "Booked" for new appointments
        startTime: startDateTime,
        endTime: endDateTime
      }
    });

    console.log("Appointment created successfully:", newAppointment);

    // Small delay to ensure database write completes
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force refetch of current date
    refetchAppointments();

    console.log("New appointment:", {
      patientName: patientName,
      ...newAppointment
    });
    setShowNewAppointment(false);
    setNewAppointment({
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      status: "Booked"
    });
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await updateAppointmentRequest({
        endpoint: `/api/appointments`,
        method: "DELETE",
        params: { id: appointmentId }
      });
      console.log("Appointment deleted successfully:", appointmentId);
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const {
    isLoading = false,
    data: patient = {},
    refetch
  } = useApiCall({
    request: {
      endpoint: "/api/patient",
      params: { id: patientId }
    },
    fetchOnMount: true
  });

  const { invokeRequest } = useApiCall();

  const { data: invoices = [] } = useApiCall({
    request: {
      endpoint: "/api/invoice",
      params: {
        patientId
      }
    },
    fetchOnMount: !!patientId
  });

  // Fetch vitals for this patient
  const { data: vitals = [], isLoading: isLoadingVitals } = useApiCall({
    request: {
      endpoint: "/api/patient/getPatientVitals",
      method: "GET",
      params: { patientId }
    },
    fetchOnMount: !!patientId
  });
  const vitalsData = groupVitalsByDate(Array.isArray(vitals) ? vitals : []);

  const patientName = useMemo(
    () =>
      `${(patient || {}).firstName || ""} ${
        (patient || {}).lastName || ""
      }`.trim(),
    [patient]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading patient information...</div>
      </div>
    );
  }
  if (!patient || !patient.patientId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Patient not found.</div>
      </div>
    );
  }
  // Initialize edit form when modal opens
  const handleEditClick = () => {
    let dobValue = "";
    if (patient.dateOfBirth) {
      // If backend returns full datetime, slice to YYYY-MM-DD
      dobValue = String(patient.dateOfBirth).slice(0, 10);
    }

    setEditedPatient({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      emailAddress: patient.emailAddress || "",
      dateOfBirth: dobValue,
      gender: patient.gender || "M"
    });

    setShowEditProfile(true);
  };

  const handleSaveEdit = async () => {
    try {
      await invokeRequest({
        endpoint: "/api/patient",
        method: "PUT",
        payload: {
          patientId,
          firstName: editedPatient.firstName,
          lastName: editedPatient.lastName,
          emailAddress: editedPatient.emailAddress,
          dateOfBirth: editedPatient.dateOfBirth,
          gender: editedPatient.gender
        }
      });

      setShowEditProfile(false);

      // refresh patient details from backend
      refetch();
    } catch (err) {
      console.error("Error updating patient", err);
      // alert("Failed to update patient");
    }
  };

  const handleDeletePatient = async () => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      await invokeRequest({
        endpoint: "/api/patient",
        method: "DELETE",
        params: { id: patientId }
      });

      // alert("Patient deleted successfully");
      onBack();
    } catch (err) {
      console.error("Error deleting patient", err);
      // alert("Failed to delete patient");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "booked":
      case "scheduled":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "active":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowNewAppointment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                  Schedule New Appointment
                </CardTitle>
                <CardDescription>
                  Create a new appointment for {patientName}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewAppointment(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Patient Name Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-slate-600">Patient</p>
                <p className="text-lg font-semibold text-slate-900">
                  {patientName}
                </p>
              </div>

              {/* Appointment Date */}
              <div className="space-y-2">
                <Label
                  htmlFor="appointmentDate"
                  className="flex items-center text-slate-700">
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  Date
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value
                    })
                  }
                  className="border-slate-300"
                />
              </div>

              {/* Start Time and End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="startTime"
                    className="flex items-center text-slate-700">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newAppointment.startTime}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        startTime: e.target.value
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="endTime"
                    className="flex items-center text-slate-700">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newAppointment.endTime}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        endTime: e.target.value
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewAppointment(false);
                    setNewAppointment({
                      date: "",
                      startTime: "",
                      endTime: "",
                      status: "Booked"
                    });
                  }}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleScheduleAppointment()}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Edit className="mr-2 h-5 w-5 text-blue-600" />
                  Edit Patient Profile
                </CardTitle>
                <CardDescription>Update patient information</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditProfile(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="flex items-center text-slate-700">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={editedPatient.firstName}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      firstName: e.target.value
                    })
                  }
                  className="border-slate-300"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="flex items-center text-slate-700">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={editedPatient.lastName}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      lastName: e.target.value
                    })
                  }
                  className="border-slate-300"
                  placeholder="Enter last name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="emailAddress"
                  className="flex items-center text-slate-700">
                  <Mail className="mr-2 h-4 w-4 text-blue-500" />
                  Email Address
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={editedPatient.emailAddress}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      emailAddress: e.target.value
                    })
                  }
                  className="border-slate-300"
                  placeholder="patient@email.com"
                />
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="flex items-center text-slate-700">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editedPatient.dateOfBirth}
                    onChange={(e) =>
                      setEditedPatient({
                        ...editedPatient,
                        dateOfBirth: e.target.value
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="flex items-center text-slate-700">
                  <Activity className="mr-2 h-4 w-4 text-blue-500" />
                  Gender
                </Label>
                <select
                  id="gender"
                  value={editedPatient.gender}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      gender: e.target.value
                    })
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditedPatient({
                      firstName: "",
                      lastName: "",
                      emailAddress: "",
                      dateOfBirth: "",
                      gender: ""
                    });
                  }}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Info Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-2xl font-semibold">
                  {patientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {patientName}
                  </h2>
                  <p className="text-slate-500">
                    Patient ID: P{patient.patientId || ""}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline" className="font-normal">
                    <User className="mr-1 h-3 w-3" />
                    Age: {patient.age || ""}
                  </Badge>
                  <Badge variant="outline" className="font-normal font-mono">
                    Gender: {patient.gender || "M"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    {patient.emailAddress || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>

              <Button variant="destructive" onClick={handleDeletePatient}>
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Appointments</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Charts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* All Appointments */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>
                Complete appointment history for this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments && (appointments || []).length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (appointments || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No appointments found for this patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(appointments || []).map((appointment) => {
                    const startTime = new Date(appointment.startTime);
                    const endTime = new Date(appointment.endTime);
                    const hours = startTime.getHours();
                    const minutes = String(startTime.getMinutes()).padStart(
                      2,
                      "0"
                    );
                    const timeString = `${hours}:${minutes}`;
                    const endHours = endTime.getHours();
                    const endMinutes = String(endTime.getMinutes()).padStart(
                      2,
                      "0"
                    );
                    const dateString = startTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                    const canViewAppointment =
                      (!isAdmin ||
                        isOwnAppointment(appointment) ||
                        (isAdmin &&
                          appointment?.appointmentStatus === "COM")) &&
                      appointment?.appointmentStatus !== "CAN";

                    return (
                      <div
                        key={appointment.appointmentID}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-lg">
                            <div className="text-center">
                              <div className="text-xs font-medium text-slate-600">
                                {hours.toString().padStart(2, "0")}
                              </div>
                              <div className="text-lg font-bold text-slate-900">
                                {minutes}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {dateString}
                            </p>
                            <p className="text-sm text-slate-600">
                              {timeString} - {endHours}:{endMinutes}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={getStatusColor(
                              convertStatusToDisplay(
                                appointment.appointmentStatus
                              )
                            )}>
                            {getStatusIcon(
                              convertStatusToDisplay(
                                appointment.appointmentStatus
                              )
                            )}
                            <span className="ml-1 capitalize">
                              {convertStatusToDisplay(
                                appointment.appointmentStatus
                              )}
                            </span>
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStartConsultation(appointment)}
                            disabled={!canViewAppointment}
                            className={
                              !canViewAppointment
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === appointment.appointmentID
                                    ? null
                                    : appointment.appointmentID
                                )
                              }>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {openMenuId === appointment.appointmentID &&
                              canViewAppointment && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                  <div className="py-1" role="menu">
                                    {["BKD"].includes(
                                      appointment?.appointmentStatus
                                    ) && (
                                      <>
                                        <button
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={() => {
                                            onStartConsultation(appointment);
                                            setOpenMenuId(null);
                                          }}>
                                          Start Consultation
                                        </button>
                                        <div className="border-t border-gray-100"></div>
                                      </>
                                    )}
                                    {["ACT"].includes(
                                      appointment?.appointmentStatus
                                    ) && (
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                          handleUpdateStatus(
                                            appointment.appointmentID,
                                            "Completed"
                                          );
                                          setOpenMenuId(null);
                                        }}>
                                        Mark as Completed
                                      </button>
                                    )}
                                    {!["CAN", "COM"].includes(
                                      appointment?.appointmentStatus
                                    ) && (
                                      <>
                                        <button
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={() => {
                                            handleUpdateStatus(
                                              appointment.appointmentID,
                                              "Cancelled"
                                            );
                                            setOpenMenuId(null);
                                          }}>
                                          Mark as Cancelled
                                        </button>
                                        <div className="border-t border-gray-100"></div>
                                      </>
                                    )}
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        handleDeleteAppointment(
                                          appointment.appointmentID
                                        );
                                        setOpenMenuId(null);
                                      }}>
                                      Delete Appointment
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          {/* ================= TOP: BODY MEASUREMENTS ================= */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <CircleGauge className="mr-2 h-4 w-4 text-blue-600" />
                Body Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-72">
                <BodyMetricsChart data={vitalsData} />
              </div>
            </CardContent>
          </Card>

          {/* ================= BOTTOM (2 COLUMNS) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* LEFT → Oxygen + Heart Rate */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <Heart className="mr-2 h-4 w-4 text-pink-500" />
                  Oxygen Saturation & Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <OxygenChart data={vitalsData} />
                </div>
              </CardContent>
            </Card>

            {/* RIGHT → Blood Pressure Trends */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <Activity className="mr-2 h-4 w-4 text-red-500" />
                  Blood Pressure Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  Systolic & Diastolic over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <CardioChart data={vitalsData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>Manage and track all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {(invoices || []).length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      No invoices found
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(invoices || []).map((invoice) => (
                      <TableRow
                        key={invoice.InvoiceID}
                        className="cursor-pointer hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {invoice.InvoiceID}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-600">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {new Date(
                              invoice?.StartTime
                            ).toLocaleDateString() || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${(Number(invoice.Amount) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onStartConsultation({
                                  appointmentID: invoice.AppointmentID,
                                  appointmentStatus: "COM"
                                })
                              }>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
