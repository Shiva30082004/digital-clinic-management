import React, { useState } from 'react';
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
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function ConsultationScreen({ appointment, onComplete, onCancel }) {
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: ''
  });

  const [consultation, setConsultation] = useState({
    chiefComplaint: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    prescription: ''
  });

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading consultation...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Consultation Session</h1>
          <p className="text-slate-600">
            {appointment.patient} - {appointment.type}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onComplete}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Consultation
          </Button>
        </div>
      </div>

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
                <p className="font-semibold text-slate-900">{appointment.patient}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">{appointment.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-semibold text-slate-900">{appointment.type}</p>
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
              <CardDescription>Record patient vitals for this consultation</CardDescription>
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
                    onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
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
                    onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp" className="flex items-center text-slate-700">
                    <Thermometer className="mr-2 h-4 w-4 text-orange-500" />
                    Temperature (°F)
                  </Label>
                  <Input 
                    id="temp"
                    placeholder="98.6"
                    type="number"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center text-slate-700">
                    <Weight className="mr-2 h-4 w-4 text-blue-500" />
                    Weight (kg)
                  </Label>
                  <Input 
                    id="weight"
                    placeholder="70"
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => setVitals({...vitals, weight: e.target.value})}
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
              <CardDescription>Record chief complaints and diagnosis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complaints" className="text-slate-700">Chief Complaints</Label>
                <Textarea 
                  id="complaints"
                  placeholder="Describe the main complaints and symptoms..."
                  className="min-h-[120px] resize-none"
                  value={consultation.chiefComplaint}
                  onChange={(e) => setConsultation({...consultation, chiefComplaint: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-slate-700">Diagnosis</Label>
                <Textarea 
                  id="diagnosis"
                  placeholder="Clinical diagnosis..."
                  className="min-h-[120px] resize-none"
                  value={consultation.diagnosis}
                  onChange={(e) => setConsultation({...consultation, diagnosis: e.target.value})}
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
                <Badge variant="outline" className="font-mono">121/80</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Weight</span>
                <Badge variant="outline" className="font-mono">73 kg</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Heart Rate</span>
                <Badge variant="outline" className="font-mono">72 bpm</Badge>
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
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onComplete}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete & Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}