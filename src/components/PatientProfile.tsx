import React, { useState } from 'react';

const appointmentHistory = [
  { id: 1, date: '2025-06-15', time: '10:00 AM', type: 'General Checkup', status: 'completed' },
  { id: 2, date: '2025-05-15', time: '2:30 PM', type: 'Follow-up', status: 'completed' },
  { id: 3, date: '2025-04-10', time: '11:15 AM', type: 'Blood Test', status: 'completed' },
  { id: 4, date: '2025-06-20', time: '9:00 AM', type: 'Consultation', status: 'scheduled' }
];

export function PatientProfile({ patient, onBack, onStartConsultation }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div 
          className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded cursor-pointer"
          onClick={onBack}
        >
          ← Back to Patients
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-2">{patient.name}</h1>
          <p className="text-gray-600">Patient Profile</p>
        </div>
        <div className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded">
          + New Appointment
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="border-2 border-gray-300 p-6 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
              {patient.name.charAt(0)}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{patient.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Age: {patient.age || 45}</span>
                <span>Blood Group: A+</span>
                <span>ID: P{patient.id}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span> +1 (555) 123-4567</span>
                <span> {patient.name.toLowerCase().replace(' ', '.')}@email.com</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded">
             Edit Profile
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex border-b-2 border-gray-300">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'appointments', label: 'Appointments' },
            { id: 'vitals', label: 'Vitals & Charts' },
            { id: 'documents', label: 'Documents' }
          ].map((tab) => (
            <div
              key={tab.id}
              className={`px-4 py-2 border-2 border-b-0 cursor-pointer ${
                activeTab === tab.id ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border-2 border-gray-300 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Visits</p>
                    <p className="text-2xl font-semibold">24</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-300 rounded"></div>
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Last BP</p>
                    <p className="text-2xl font-semibold">121/80</p>
                  </div>
                  <div className="w-8 h-8 bg-red-300 rounded"></div>
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Heart Rate</p>
                    <p className="text-2xl font-semibold">72 bpm</p>
                  </div>
                  <div className="w-8 h-8 bg-green-300 rounded"></div>
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Weight</p>
                    <p className="text-2xl font-semibold">73 kg</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="border-2 border-gray-300 p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
              <div className="space-y-3">
                {appointmentHistory.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border-2 border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div>
                        <p className="font-medium">{appointment.type}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-2 py-1 bg-gray-200 border border-gray-400 rounded text-xs">
                        {appointment.status}
                      </div>
                      {appointment.status === 'scheduled' && (
                        <div 
                          className="px-2 py-1 bg-blue-200 border border-blue-400 rounded cursor-pointer text-xs"
                          onClick={() => onStartConsultation(appointment)}
                        >
                          Start
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="border-2 border-gray-300 p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="w-24 h-8 bg-blue-200 border-2 border-blue-400 rounded"></div>
            </div>
            <div className="space-y-4">
              {appointmentHistory.map((appointment) => (
                <div key={appointment.id} className="border-2 border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="h-4 bg-gray-400 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 border border-gray-400 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    {appointment.status === 'scheduled' && (
                      <div 
                        className="w-24 h-6 bg-blue-200 border border-blue-400 rounded cursor-pointer"
                        onClick={() => onStartConsultation(appointment)}
                      ></div>
                    )}
                    {appointment.status === 'completed' && (
                      <div className="w-20 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="border-2 border-gray-300 p-6 bg-white">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-64 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
                <div className="text-gray-500">Vitals Chart Placeholder</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border-2 border-gray-300 p-6 bg-white">
                <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
                <div className="h-48 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
                  <div className="text-gray-500">Chart Placeholder</div>
                </div>
              </div>

              <div className="border-2 border-gray-300 p-6 bg-white">
                <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
                <div className="h-48 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
                  <div className="text-gray-500">Chart Placeholder</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="border-2 border-gray-300 p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="w-24 h-8 bg-blue-200 border-2 border-blue-400 rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-400 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}