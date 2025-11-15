import React from 'react';

// Mock data
const todaysAppointments = [
  { id: 1, time: '09:00', patient: "Jahnavi J", status: 'waiting', type: 'General Checkup' },
  { id: 2, time: '09:30', patient: "Arjun S", status: 'active', type: 'Follow-up' },
  { id: 3, time: '10:00', patient: "Grace L", status: 'completed', type: 'Consultation' },
  { id: 4, time: '10:30', patient: "Shiv B", status: 'waiting', type: 'Blood Test' },
  { id: 5, time: '11:00', patient: "David D", status: 'scheduled', type: 'Physical Exam' },
];


export function DoctorDashboard({ onPatientSelect, onStartConsultation }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. Doctor</p>
        </div>
        <div className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded">
          + New Appointment
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Today's Appointments</p>
              <p className="text-2xl font-semibold">XX</p>
            </div>
            <div className="w-8 h-8 bg-blue-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Active Patients</p>
              <p className="text-2xl font-semibold">XXX</p>
            </div>
            <div className="w-8 h-8 bg-green-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Monthly Revenue</p>
              <p className="text-2xl font-semibold">$XXXXX</p>
            </div>
            <div className="w-8 h-8 bg-purple-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Pending Invoices</p>
              <p className="text-2xl font-semibold">X</p>
            </div>
            <div className="w-8 h-8 bg-orange-300 rounded"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="border-2 border-gray-300 p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Today's Appointments</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 border border-gray-400 rounded flex items-center justify-center">←</div>
                <span className="text-sm">Wed, September 17, 2025</span>
                <div className="w-8 h-8 bg-gray-200 border border-gray-400 rounded flex items-center justify-center">→</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border-2 border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium w-12">{appointment.time}</div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-gray-200 border border-gray-400 rounded text-xs">
                      {appointment.status}
                    </div>
                    <div 
                      className="px-2 py-1 bg-blue-200 border border-blue-400 rounded cursor-pointer text-xs"
                      onClick={() => onStartConsultation(appointment)}
                    >
                      View
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Search */}
        <div>
          <div className="border-2 border-gray-300 p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Quick Patient Search</h3>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  className="w-full h-10 bg-gray-100 border-2 border-gray-300 rounded px-3"
                  placeholder="Search patients..."
                />
              </div>
              <div className="space-y-2">
                <div 
                  className="p-2 border-2 border-gray-200 cursor-pointer hover:bg-gray-50" 
                  onClick={() => onPatientSelect({ id: 1, name: 'Jahnavi J' })}
                >
                  <p className="font-medium">Jahnavi J</p>
                  <p className="text-sm text-gray-600">Last visit: 2 days ago</p>
                </div>
                <div 
                  className="p-2 border-2 border-gray-200 cursor-pointer hover:bg-gray-50" 
                  onClick={() => onPatientSelect({ id: 2, name: 'Arjun S' })}
                >
                  <p className="font-medium">Arjun S</p>
                  <p className="text-sm text-gray-600">Last visit: 1 week ago</p>
                </div>
                <div 
                  className="p-2 border-2 border-gray-200 cursor-pointer hover:bg-gray-50" 
                  onClick={() => onPatientSelect({ id: 3, name: 'Grace L' })}
                >
                  <p className="font-medium">Grace L</p>
                  <p className="text-sm text-gray-600">Last visit: 3 days ago</p>
                </div>
              </div>
              <div className="w-full h-8 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                View All Patients
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts - Simple placeholder boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-2 border-gray-300 p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Monthly Income Trend</h3>
          <div className="h-64 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-gray-500">[Income Chart: Jan $45k → Jun $67k]</div>
          </div>
        </div>

        <div className="border-2 border-gray-300 p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Patient Visits This Week</h3>
          <div className="h-64 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-gray-500">[Visits Chart: Mon 12, Tue 15, Wed 8, Thu 18...]</div>
          </div>
        </div>
      </div>
    </div>
  );
}