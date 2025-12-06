import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useApiCall from '@/hooks/useApiCall';

// Mock data
// Mock data (can be removed once all features are integrated)
const todaysAppointments = [
  { id: 1, time: '09:00', patient: "Jahnavi J", status: 'Booked', type: 'General Checkup' },
  { id: 2, time: '09:30', patient: "Arjun S", status: 'Active', type: 'Follow-up' },
  { id: 3, time: '10:00', patient: "Grace L", status: 'Completed', type: 'Consultation' },
  { id: 4, time: '10:30', patient: "Shiv B", status: 'Booked', type: 'Blood Test' },
  { id: 5, time: '11:00', patient: "David D", status: 'Booked', type: 'Physical Exam' },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    case 'active':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    case 'booked':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    case 'cancelled':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'active':
      return <Activity className="h-4 w-4" />;
    default:
      return <CircleDashed className="h-4 w-4" />;
  }
};


export function DoctorDashboard({ onPatientSelect, onStartConsultation }) {
  const { invokeRequest: createAppointmentRequest } = useApiCall();
  const { invokeRequest: fetchAppointmentsRequest, data: appointmentsData, isLoading: isLoadingAppointments } = useApiCall<any[]>();
  const { invokeRequest: fetchPatientsRequest, data: patientsData, isLoading: isLoadingPatients } = useApiCall<any[]>();
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const lastFetchedDateRef = useRef<string>(''); // Use ref instead of state for persistence
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [appointmentError, setAppointmentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch patients on mount
  useEffect(() => {
    fetchPatientsRequest({
      endpoint: '/api/patient',
      method: 'GET'
    });
  }, []);

  // Helper function to format date as YYYY-MM-DD
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to convert status to API format
  const convertStatusToApi = (displayStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'Booked': 'BKD',
      'Active': 'ACT',
      'Completed': 'COM',
      'Cancelled': 'CAN'
    };
    return statusMap[displayStatus] || 'BKD';
  };

  // Helper function to convert API status to display format
  const convertStatusToDisplay = (apiStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'BKD': 'Booked',
      'ACT': 'Active',
      'COM': 'Completed',
      'CAN': 'Cancelled'
    };
    return statusMap[apiStatus] || 'Booked';
  };

  // Fetch appointments for selected date
  const fetchAppointments = async (date: Date, forceRefresh = false) => {
    try {
      const dateStr = formatDateForApi(date);
      
      // Skip fetch if we already have data for this date (unless forced)
      if (!forceRefresh && dateStr === lastFetchedDateRef.current && appointments.length > 0) {
        console.log('Skipping fetch - data already loaded for', dateStr);
        return;
      }
      
      await fetchAppointmentsRequest({
        endpoint: '/api/appointments/byDate',
        method: 'GET',
        params: {
          startDate: dateStr,
          endDate: dateStr
        }
      });
      
      lastFetchedDateRef.current = dateStr; // Update ref instead of state
      
      // The data will be set via the useApiCall hook's data state
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
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
    setAppointmentError('');

    try {
      // Combine date and time into ISO datetime format
      const startDateTime = `${newAppointment.date}T${newAppointment.startTime}:00`;
      const endDateTime = `${newAppointment.date}T${newAppointment.endTime}:00`;

      // Call API to create appointment
      await createAppointmentRequest({
        endpoint: '/api/appointments',
        method: 'POST',
        payload: {
          patientID: newAppointment.patientId,
          appointmentStatus: 'BKD', // Always "Booked" for new appointments
          startTime: startDateTime,
          endTime: endDateTime
        }
      });

      console.log('Appointment created successfully:', newAppointment);
      
      // Small delay to ensure database write completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refetch of current date
      await fetchAppointments(selectedDate, true); // true = force refresh
      
      // Close dialog and reset form after successful creation and refresh
      setIsNewAppointmentOpen(false);
      setNewAppointment({
        patientId: '',
        date: '',
        startTime: '',
        endTime: ''
      });

    } catch (error) {
      console.error('Failed to create appointment:', error);
      setAppointmentError('Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await createAppointmentRequest({
        endpoint: `/api/appointments`,
        method: 'DELETE',
        params: { id: appointmentId }
      });
      console.log('Appointment deleted successfully:', appointmentId);
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await createAppointmentRequest({
        endpoint: `/api/appointments`,
        method: 'PUT',
        params: { id: appointmentId },
        payload: {
          appointmentStatus: convertStatusToApi(newStatus)
        }
      });
      console.log('Appointment status updated:', appointmentId, newStatus);
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Good Morning, Doctor</h1>
          <p className="text-slate-600">You have {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} for {formatDateForDisplay(selectedDate)}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsNewAppointmentOpen(true)}
        >
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
              <CardDescription>Manage your schedule for the selected date</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
                {formatDateForDisplay(selectedDate)}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleNextDay}
              >
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
                const minutes = String(startTime.getMinutes()).padStart(2, '0');
                const timeString = `${hours}:${minutes}`;
                const patientName = appointment.patientFirstName && appointment.patientLastName 
                  ? `${appointment.patientFirstName} ${appointment.patientLastName}`
                  : `Patient ID: ${appointment.patientID}`;
                
                return (
                  <div 
                    key={appointment.appointmentID} 
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-lg">
                        <div className="text-center">
                          <div className="text-xs font-medium text-slate-600">
                            {hours.toString().padStart(2, '0')}
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {minutes}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{patientName}</p>
                        <p className="text-sm text-slate-600">{timeString} - {new Date(appointment.endTime).getHours()}:{String(new Date(appointment.endTime).getMinutes()).padStart(2, '0')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getStatusColor(convertStatusToDisplay(appointment.appointmentStatus))}>
                        {getStatusIcon(convertStatusToDisplay(appointment.appointmentStatus))}
                        <span className="ml-1 capitalize">{convertStatusToDisplay(appointment.appointmentStatus)}</span>
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onStartConsultation(appointment)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setOpenMenuId(openMenuId === appointment.appointmentID ? null : appointment.appointmentID)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openMenuId === appointment.appointmentID && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1" role="menu">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  onStartConsultation(appointment);
                                  setOpenMenuId(null);
                                }}
                              >
                                Start Consultation
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  handleUpdateStatus(appointment.appointmentID, 'Booked');
                                  setOpenMenuId(null);
                                }}
                              >
                                Mark as Booked
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  handleUpdateStatus(appointment.appointmentID, 'Active');
                                  setOpenMenuId(null);
                                }}
                              >
                                Mark as Active
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  handleUpdateStatus(appointment.appointmentID, 'Completed');
                                  setOpenMenuId(null);
                                }}
                              >
                                Mark as Completed
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  handleUpdateStatus(appointment.appointmentID, 'Cancelled');
                                  setOpenMenuId(null);
                                }}
                              >
                                Mark as Cancelled
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  handleDeleteAppointment(appointment.appointmentID);
                                  setOpenMenuId(null);
                                }}
                              >
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
              Monthly Income Trend
            </CardTitle>
            <CardDescription>Revenue overview for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-slate-200">
              <div className="text-center text-slate-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-purple-400" />
                <p className="text-sm">Chart: Jan $45k → Jun $67k</p>
                <p className="text-xs mt-1">+48% growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Patient Visits This Week
            </CardTitle>
            <CardDescription>Daily patient visit statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-slate-200">
              <div className="text-center text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-green-400" />
                <p className="text-sm">Chart: Mon 12, Tue 15, Wed 8, Thu 18...</p>
                <p className="text-xs mt-1">Average: 13 visits/day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
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
                }}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPatients ? (
                    <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                  ) : patients.length === 0 ? (
                    <SelectItem value="empty" disabled>No patients found</SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.patientId} value={patient.patientId.toString()}>
                        {patient.firstName} {patient.lastName} {patient.emailAddress ? `(${patient.emailAddress})` : ''}
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
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newAppointment.startTime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newAppointment.endTime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newAppointment.patientId || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}