import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Heart,
  Weight,
  Thermometer,
  FileText,
  Download,
  Eye,
  TrendingUp,
  Clock,
  X,
  Edit,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const appointmentHistory = [
  { id: 1, date: '2025-06-15', time: '10:00 AM', type: 'General Checkup', status: 'Completed' },
  { id: 2, date: '2025-05-15', time: '2:30 PM', type: 'Follow-up', status: 'Completed' },
  { id: 3, date: '2025-04-10', time: '11:15 AM', type: 'Blood Test', status: 'Completed' },
  { id: 4, date: '2025-06-20', time: '9:00 AM', type: 'Consultation', status: 'Booked' }
];

const mockDocuments = [
  { id: 1, name: 'Prescription - June 2025', type: 'PDF', date: '2025-06-15' },
  { id: 2, name: 'Lab Report - Blood Test', type: 'PDF', date: '2025-04-10' },
  { id: 3, name: 'Medical Certificate', type: 'PDF', date: '2025-03-22' }
];

export function PatientProfile({ patient, onBack, onStartConsultation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    startTime: '',
    endTime: '',
    status: 'Booked'
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedPatient, setEditedPatient] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    dateOfBirth: '',
    bloodGroup: ''
  });
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading patient information...</div>
      </div>
    );
  }

  // Initialize edit form when modal opens
  const handleEditClick = () => {
    // TODO: BACKEND INTEGRATION - Fetch actual patient data from API
    // Example: const response = await fetch(`/api/patient/${patient.id}`);
    // const patientData = await response.json();
    const nameParts = patient.name.split(' ');
    setEditedPatient({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      emailAddress: patient.name.toLowerCase().replace(' ', '.') + '@email.com',
      dateOfBirth: '', // TODO: Load from backend
      bloodGroup: 'A+' // TODO: Load from backend
    });
    setShowEditProfile(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'booked':
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'active':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'cancelled':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
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
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowNewAppointment(true)}
        >
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
                <CardDescription>Create a new appointment for {patient.name}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowNewAppointment(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Patient Name Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-slate-600">Patient</p>
                <p className="text-lg font-semibold text-slate-900">{patient.name}</p>
              </div>

              {/* Appointment Date */}
              <div className="space-y-2">
                <Label htmlFor="appointmentDate" className="flex items-center text-slate-700">
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  Date
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="border-slate-300"
                />
              </div>

              {/* Start Time and End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="flex items-center text-slate-700">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newAppointment.startTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="flex items-center text-slate-700">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newAppointment.endTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
              </div>

              {/* Appointment Status */}
              <div className="space-y-2">
                <Label htmlFor="appointmentStatus" className="text-slate-700">
                  Appointment Status
                </Label>
                <select
                  id="appointmentStatus"
                  value={newAppointment.status}
                  onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Booked">Booked</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowNewAppointment(false);
                    setNewAppointment({ date: '', startTime: '', endTime: '', status: 'Booked' });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // TODO: BACKEND INTEGRATION - Save appointment to database
                    // Example: await fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ patientId: patient.id, ...newAppointment }) });
                    console.log('New appointment:', {
                      patientName: patient.name,
                      ...newAppointment
                    });
                    setShowNewAppointment(false);
                    setNewAppointment({ date: '', startTime: '', endTime: '', status: 'Booked' });
                  }}
                >
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
                onClick={() => setShowEditProfile(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center text-slate-700">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={editedPatient.firstName}
                  onChange={(e) => setEditedPatient({ ...editedPatient, firstName: e.target.value })}
                  className="border-slate-300"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center text-slate-700">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={editedPatient.lastName}
                  onChange={(e) => setEditedPatient({ ...editedPatient, lastName: e.target.value })}
                  className="border-slate-300"
                  placeholder="Enter last name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="flex items-center text-slate-700">
                  <Mail className="mr-2 h-4 w-4 text-blue-500" />
                  Email Address
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={editedPatient.emailAddress}
                  onChange={(e) => setEditedPatient({ ...editedPatient, emailAddress: e.target.value })}
                  className="border-slate-300"
                  placeholder="patient@email.com"
                />
              </div>

              {/* Date of Birth and Blood Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center text-slate-700">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editedPatient.dateOfBirth}
                    onChange={(e) => setEditedPatient({ ...editedPatient, dateOfBirth: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="flex items-center text-slate-700">
                    <Activity className="mr-2 h-4 w-4 text-blue-500" />
                    Blood Group
                  </Label>
                  <select
                    id="bloodGroup"
                    value={editedPatient.bloodGroup}
                    onChange={(e) => setEditedPatient({ ...editedPatient, bloodGroup: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditedPatient({ firstName: '', lastName: '', emailAddress: '', dateOfBirth: '', bloodGroup: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // TODO: BACKEND INTEGRATION - Update patient details in database
                    // Example: await fetch(`/api/patient/${patient.id}`, { method: 'PUT', body: JSON.stringify(editedPatient) });
                    console.log('Updated patient details:', editedPatient);
                    setShowEditProfile(false);
                  }}
                >
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
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-2xl font-semibold">
                  {patient.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                  <p className="text-slate-500">Patient ID: P{patient.id}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline" className="font-normal">
                    <User className="mr-1 h-3 w-3" />
                    Age: {patient.age || 45}
                  </Badge>
                  <Badge variant="outline" className="font-normal font-mono">
                    Blood: A+
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    {patient.name.toLowerCase().replace(' ', '.')}@email.com
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Visits</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">24</div>
                <p className="text-xs text-slate-500 mt-1">Last: 2 days ago</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Blood Pressure</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">121/80</div>
                <p className="text-xs text-green-600 mt-1">Normal range</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">72</div>
                <p className="text-xs text-slate-500 mt-1">bpm</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Weight</CardTitle>
                <Weight className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">73</div>
                <p className="text-xs text-slate-500 mt-1">kg</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Appointments */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest consultation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentHistory.slice(0, 3).map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{appointment.type}</p>
                        <p className="text-sm text-slate-600">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {(appointment.status === 'Booked' || appointment.status === 'Active') && (
                        <Button 
                          size="sm" 
                          onClick={() => onStartConsultation(appointment)}
                        >
                          Start
                        </Button>
                      )}
                      {appointment.status === 'Completed' && (
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Vital Signs Trends
              </CardTitle>
              <CardDescription>Historical data and trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center text-slate-500">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-medium">Vitals Chart</p>
                  <p className="text-sm mt-2">Blood Pressure, Heart Rate, Weight trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Activity className="mr-2 h-4 w-4 text-red-600" />
                  Blood Pressure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="text-center text-slate-500">
                    <p className="text-sm">BP Trend Chart</p>
                    <p className="text-xs mt-1">Last 6 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Weight className="mr-2 h-4 w-4 text-purple-600" />
                  Weight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border border-slate-200">
                  <div className="text-center text-slate-500">
                    <p className="text-sm">Weight Trend Chart</p>
                    <p className="text-xs mt-1">Last 6 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}