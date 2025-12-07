import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  Search,
  Eye,
  CheckCircle,
  CircleDashed,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import useApiCall from "@/hooks/useApiCall";
import Appointment from "@/types/Appointment";
import Patient from "@/types/Patient";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "active":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "booked":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "cancelled":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  }
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

export function DoctorDashboard({ onStartConsultation, doctorInfo }) {
  const { invokeRequest: createAppointmentRequest } = useApiCall();
  const {
    invokeRequest: fetchAppointmentsRequest,
    data: appointmentsData,
    isLoading: isLoadingAppointments
  } = useApiCall<Appointment[]>();
  const {
    invokeRequest: fetchPatientsRequest,
    data: patientsData,
    isLoading: isLoadingPatients
  } = useApiCall<Patient[]>();
  const {
    invokeRequest: fetchRevenueRequest,
    data: revenueData,
    isLoading: isLoadingRevenue
  } = useApiCall<any[]>();
  const {
    invokeRequest: fetchVisitsRequest,
    data: visitsData,
    isLoading: isLoadingVisits
  } = useApiCall<any[]>();
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const lastFetchedDateRef = useRef<string>(""); // Use ref instead of state for persistence
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: "",
    startTime: "",
    endTime: ""
  });
  const [appointmentError, setAppointmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if appointment belongs to current doctor
  const isOwnAppointment = (appointment: any) => {
    return appointment.doctorID === doctorInfo?.doctorId;
  };

  // Check if user is admin
  const isAdmin = doctorInfo?.role === "admin";

  // Update appointments when data changes
  useEffect(() => {
    if (appointmentsData) {
      setAppointments(appointmentsData);
    }
  }, [appointmentsData]);

  // Update patients when data changes
  useEffect(() => {
    if (patientsData) {
      setPatients(patientsData);
    }
  }, [patientsData]);

  // Update revenue stats when data changes
  useEffect(() => {
    if (revenueData) {
      setRevenueStats(revenueData);
    }
  }, [revenueData]);

  // Update visit stats when data changes
  useEffect(() => {
    if (visitsData) {
      setVisitStats(visitsData);
    }
  }, [visitsData]);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatientsRequest({
      endpoint: "/api/patient",
      method: "GET"
    });
  }, []);

  // Fetch analytics data on mount (only for admin)
  useEffect(() => {
    if (doctorInfo?.role === "admin") {
      // Fetch revenue data (last 6 months)
      fetchRevenueRequest({
        endpoint: "/api/analytics/revenue",
        method: "GET"
      });

      // Fetch visits data (last 6 months)
      fetchVisitsRequest({
        endpoint: "/api/analytics/visits",
        method: "GET"
      });
    }
  }, [doctorInfo]);

  // Helper function to format date as YYYY-MM-DD
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Helper function to convert status to API format
  const convertStatusToApi = (displayStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      Booked: "BKD",
      Active: "ACT",
      Completed: "COM",
      Cancelled: "CAN"
    };
    return statusMap[displayStatus] || "BKD";
  };

  // Helper function to convert API status to display format
  const convertStatusToDisplay = (apiStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      BKD: "Booked",
      ACT: "Active",
      COM: "Completed",
      CAN: "Cancelled"
    };
    return statusMap[apiStatus] || "Booked";
  };

  // Fetch appointments for selected date
  const fetchAppointments = async (date: Date, forceRefresh = false) => {
    try {
      const dateStr = formatDateForApi(date);

      // Skip fetch if we already have data for this date (unless forced)
      if (
        !forceRefresh &&
        dateStr === lastFetchedDateRef.current &&
        appointments.length > 0
      ) {
        console.log("Skipping fetch - data already loaded for", dateStr);
        return;
      }

      await fetchAppointmentsRequest({
        endpoint: "/api/appointments/byDate",
        method: "GET",
        params: {
          startDate: dateStr,
          endDate: dateStr
        }
      });

      lastFetchedDateRef.current = dateStr; // Update ref instead of state

      // The data will be set via the useApiCall hook's data state
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    }
  };

  // Refetch current appointments - always uses current selectedDate
  const refetchAppointments = () => {
    fetchAppointments(selectedDate, true); // true = force refresh
  };

  // Fetch appointments on mount and when date changes
  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  // Navigate to previous day
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleScheduleAppointment = async () => {
    setIsSubmitting(true);
    setAppointmentError("");

    try {
      // Combine date and time into ISO datetime format
      const startDateTime = `${newAppointment.date}T${newAppointment.startTime}:00`;
      const endDateTime = `${newAppointment.date}T${newAppointment.endTime}:00`;

      // Call API to create appointment
      await createAppointmentRequest({
        endpoint: "/api/appointments",
        method: "POST",
        payload: {
          patientID: newAppointment.patientId,
          appointmentStatus: "BKD", // Always "Booked" for new appointments
          startTime: startDateTime,
          endTime: endDateTime
        }
      });

      console.log("Appointment created successfully:", newAppointment);

      // Small delay to ensure database write completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force refetch of current date
      await fetchAppointments(selectedDate, true); // true = force refresh

      // Close dialog and reset form after successful creation and refresh
      setIsNewAppointmentOpen(false);
      setNewAppointment({
        patientId: "",
        date: "",
        startTime: "",
        endTime: ""
      });
    } catch (error) {
      console.error("Failed to create appointment:", error);
      setAppointmentError("Failed to create appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await createAppointmentRequest({
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

  const handleUpdateStatus = async (
    appointmentId: number,
    newStatus: string
  ) => {
    try {
      await createAppointmentRequest({
        endpoint: `/api/appointments`,
        method: "PUT",
        params: { id: appointmentId },
        payload: {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Good Morning, Doctor
          </h1>
          <p className="text-slate-600">
            You have {appointments.length} appointment
            {appointments.length !== 1 ? "s" : ""} for{" "}
            {formatDateForDisplay(selectedDate)}
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsNewAppointmentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Appointments by Date */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                Manage your schedule for the selected date
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
                {formatDateForDisplay(selectedDate)}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments && appointments.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const startTime = new Date(appointment.startTime);
                const hours = startTime.getHours();
                const minutes = String(startTime.getMinutes()).padStart(2, "0");
                const timeString = `${hours}:${minutes}`;
                const patientName =
                  appointment.patientFirstName && appointment.patientLastName
                    ? `${appointment.patientFirstName} ${appointment.patientLastName}`
                    : `Patient ID: ${appointment.patientID}`;

                // Check if this appointment can be viewed/edited by current doctor
                const canViewAppointment =
                  (!isAdmin || isOwnAppointment(appointment) || (isAdmin && appointment?.appointmentStatus === "COM")) &&
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
                          {patientName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {timeString} -{" "}
                          {new Date(appointment.endTime).getHours()}:
                          {String(
                            new Date(appointment.endTime).getMinutes()
                          ).padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(
                          convertStatusToDisplay(appointment.appointmentStatus)
                        )}>
                        {getStatusIcon(
                          convertStatusToDisplay(appointment.appointmentStatus)
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
                          }
                          disabled={!canViewAppointment}>
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

      {/* Charts - Only visible for admins */}
      {doctorInfo?.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                Monthly Income Trend
              </CardTitle>
              <CardDescription>
                Revenue overview for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : revenueStats.length === 0 ? (
                <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="text-center text-slate-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm">No revenue data available</p>
                    <p className="text-xs mt-1">
                      Complete appointments to see revenue statistics
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-slate-200">
                  <div className="space-y-3">
                    {revenueStats
                      .slice()
                      .reverse()
                      .map((stat, index) => {
                        const monthNames = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec"
                        ];
                        const monthName = monthNames[stat.accountMonth - 1];
                        const revenue = stat.totalRevenue || 0;
                        const maxRevenue = Math.max(
                          ...revenueStats.map((s) => s.totalRevenue || 0)
                        );
                        const barWidth =
                          maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className="text-xs font-medium text-slate-600 w-12">
                              {monthName} '{String(stat.accountYear).slice(-2)}
                            </div>
                            <div className="flex-1 bg-white rounded-full h-6 overflow-hidden border border-purple-200">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${barWidth}%` }}>
                                {barWidth > 20 && (
                                  <span className="text-xs font-semibold text-white">
                                    ${(revenue / 1000).toFixed(1)}k
                                  </span>
                                )}
                              </div>
                            </div>
                            {barWidth <= 20 && (
                              <div className="text-xs font-semibold text-slate-700 w-16 text-right">
                                ${(revenue / 1000).toFixed(1)}k
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  {revenueStats.length >= 2 && (
                    <div className="mt-4 pt-3 border-t border-purple-200">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>
                          Latest: $
                          {(
                            (revenueStats[0]?.totalRevenue || 0) / 1000
                          ).toFixed(1)}
                          k
                        </span>
                        <span>
                          {(() => {
                            const latest = revenueStats[0]?.totalRevenue || 0;
                            const previous = revenueStats[1]?.totalRevenue || 0;
                            const growth =
                              previous > 0
                                ? ((latest - previous) / previous) * 100
                                : 0;
                            return growth >= 0
                              ? `↑ ${growth.toFixed(1)}% growth`
                              : `↓ ${Math.abs(growth).toFixed(1)}% decline`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Monthly Patient Visits
              </CardTitle>
              <CardDescription>
                Visit statistics for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVisits ? (
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : visitStats.length === 0 ? (
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="text-center text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-green-400" />
                    <p className="text-sm">No visit data available</p>
                    <p className="text-xs mt-1">
                      Schedule appointments to see visit statistics
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-slate-200">
                  <div className="space-y-3">
                    {visitStats
                      .slice()
                      .reverse()
                      .map((stat, index) => {
                        const monthNames = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec"
                        ];
                        const monthName = monthNames[stat.visitMonth - 1];
                        const visits = stat.totalVisits || 0;
                        const maxVisits = Math.max(
                          ...visitStats.map((s) => s.totalVisits || 0)
                        );
                        const barWidth =
                          maxVisits > 0 ? (visits / maxVisits) * 100 : 0;

                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className="text-xs font-medium text-slate-600 w-12">
                              {monthName} '{String(stat.visitYear).slice(-2)}
                            </div>
                            <div className="flex-1 bg-white rounded-full h-6 overflow-hidden border border-green-200">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${barWidth}%` }}>
                                {barWidth > 20 && (
                                  <span className="text-xs font-semibold text-white">
                                    {visits} visits
                                  </span>
                                )}
                              </div>
                            </div>
                            {barWidth <= 20 && (
                              <div className="text-xs font-semibold text-slate-700 w-20 text-right">
                                {visits} visits
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  {visitStats.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-green-200">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>
                          Latest: {visitStats[0]?.totalVisits || 0} visits
                        </span>
                        <span>
                          Avg:{" "}
                          {Math.round(
                            visitStats.reduce(
                              (acc, s) => acc + (s.totalVisits || 0),
                              0
                            ) / visitStats.length
                          )}{" "}
                          visits/month
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Appointment Dialog */}
      <Dialog
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) => {
                  setNewAppointment({
                    ...newAppointment,
                    patientId: value
                  });
                }}>
                <SelectTrigger id="patient">
                  <SelectValue
                    placeholder={
                      isLoadingPatients
                        ? "Loading patients..."
                        : "Select a patient"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPatients ? (
                    <SelectItem value="loading" disabled>
                      Loading patients...
                    </SelectItem>
                  ) : patients.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No patients found
                    </SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem
                        key={patient.patientId}
                        value={patient.patientId.toString()}>
                        {patient.firstName} {patient.lastName}{" "}
                        {patient.emailAddress
                          ? `(${patient.emailAddress})`
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Select from existing patients or add new patient first
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newAppointment.date}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, date: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
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
                />
              </div>
            </div>

            {appointmentError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {appointmentError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAppointmentOpen(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !newAppointment.patientId ||
                !newAppointment.date ||
                !newAppointment.startTime ||
                !newAppointment.endTime ||
                isSubmitting
              }>
              {isSubmitting ? "Creating..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
