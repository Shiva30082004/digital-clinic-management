import React, { useState } from 'react';
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

// Mock data
const todaysAppointments = [
  { id: 1, time: '09:00', patient: "Jahnavi J", status: 'Booked', type: 'General Checkup' },
  { id: 2, time: '09:30', patient: "Arjun S", status: 'Active', type: 'Follow-up' },
  { id: 3, time: '10:00', patient: "Grace L", status: 'Completed', type: 'Consultation' },
  { id: 4, time: '10:30', patient: "Shiv B", status: 'Booked', type: 'Blood Test' },
  { id: 5, time: '11:00', patient: "David D", status: 'Booked', type: 'Physical Exam' },
];

const recentPatients = [
  { id: 1, name: 'Jahnavi J', lastVisit: '2 days ago' },
  { id: 2, name: 'Arjun S', lastVisit: '1 week ago' },
  { id: 3, name: 'Grace L', lastVisit: '3 days ago' },
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
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'Booked'
  });

  const handleScheduleAppointment = () => {
    // TODO: Call API to create appointment
    console.log('Scheduling appointment:', newAppointment);
    setIsNewAppointmentOpen(false);
    // Reset form
    setNewAppointment({
      patientId: '',
      patientName: '',
      date: '',
      startTime: '',
      endTime: '',
      status: 'Booked'
    });
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    // TODO: Call API to delete appointment
    console.log('Deleting appointment:', appointmentId);
  };

  const handleUpdateStatus = (appointmentId: number, newStatus: string) => {
    // TODO: Call API to update appointment status
    console.log('Updating appointment status:', appointmentId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Good Morning, Doctor</h1>
          <p className="text-slate-600">You have 5 appointments today</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsNewAppointmentOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Today's Appointments */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Manage your schedule for today</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
                Wed, Sep 17, 2025
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-600">
                        {appointment.time.split(':')[0]}
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {appointment.time.split(':')[1]}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{appointment.patient}</p>
                    <p className="text-sm text-slate-600">{appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 capitalize">{appointment.status}</span>
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
                      onClick={() => setOpenMenuId(openMenuId === appointment.id ? null : appointment.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {openMenuId === appointment.id && (
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
                              handleUpdateStatus(appointment.id, 'Booked');
                              setOpenMenuId(null);
                            }}
                          >
                            Mark as Booked
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleUpdateStatus(appointment.id, 'Active');
                              setOpenMenuId(null);
                            }}
                          >
                            Mark as Active
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleUpdateStatus(appointment.id, 'Completed');
                              setOpenMenuId(null);
                            }}
                          >
                            Mark as Completed
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleUpdateStatus(appointment.id, 'Cancelled');
                              setOpenMenuId(null);
                            }}
                          >
                            Mark as Cancelled
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              handleDeleteAppointment(appointment.id);
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
            ))}
          </div>
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
                  const patient = recentPatients.find(p => p.id.toString() === value);
                  setNewAppointment({
                    ...newAppointment,
                    patientId: value,
                    patientName: patient?.name || ''
                  });
                }}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {recentPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
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

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newAppointment.status}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAppointmentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newAppointment.patientId || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime}
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}