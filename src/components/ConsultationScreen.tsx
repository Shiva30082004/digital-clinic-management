import React, { useState } from 'react';

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
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Consultation Session</h1>
          <p className="text-gray-600">
            {appointment.patient} - {appointment.type}
          </p>
        </div>
        <div className="flex space-x-2">
          <div 
            className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded cursor-pointer"
            onClick={onCancel}
          >
            ✕ Cancel
          </div>
          <div 
            className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded cursor-pointer"
            onClick={onComplete}
          >
            Complete Consultation
          </div>
        </div>
      </div>

      {/* Patient & Appointment Info */}
      <div className="border-2 border-gray-300 p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-300 rounded"></div>
            <div>
              <p className="font-medium">{appointment.patient}</p>
              <p className="text-sm text-gray-600">Patient</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-300 rounded"></div>
            <div>
              <p className="font-medium">{appointment.time}</p>
              <p className="text-sm text-gray-600">Appointment Time</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-300 rounded"></div>
            <div>
              <p className="font-medium">{appointment.type}</p>
              <p className="text-sm text-gray-600">Type</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Section */}
        <div className="border-2 border-gray-300 p-6 bg-white">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
            <h3 className="text-lg font-semibold">Vital Signs</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blood Pressure</label>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-300 rounded"></div>
                  <input 
                    className="flex-1 h-8 bg-gray-100 border-2 border-gray-300 rounded px-2" 
                    placeholder="120/80"
                    value={vitals.bloodPressure}
                    onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-300 rounded"></div>
                  <input 
                    className="flex-1 h-8 bg-gray-100 border-2 border-gray-300 rounded px-2" 
                    placeholder="72"
                    value={vitals.heartRate}
                    onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Temperature (°F)</label>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-300 rounded"></div>
                  <input 
                    className="flex-1 h-8 bg-gray-100 border-2 border-gray-300 rounded px-2" 
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-300 rounded"></div>
                  <input 
                    className="flex-1 h-8 bg-gray-100 border-2 border-gray-300 rounded px-2" 
                    placeholder="70"
                    value={vitals.weight}
                    onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-2 border-gray-300 p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="w-full h-8 bg-gray-100 border-2 border-gray-300 rounded flex items-center px-3">
               View Previous Records
            </div>
            <div className="w-full h-8 bg-gray-100 border-2 border-gray-300 rounded flex items-center px-3">
               View Vital History
            </div>
            <div className="w-full h-8 bg-gray-100 border-2 border-gray-300 rounded flex items-center px-3">
               Patient Profile
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Recent Vitals</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Last BP:</span>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">121/80</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Weight:</span>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">73 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Last HR:</span>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">72 bpm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Notes */}
      <div className="border-2 border-gray-300 p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Consultation Details</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Symptoms</label>
              <textarea 
                className="w-full h-20 bg-gray-100 border-2 border-gray-300 rounded p-3 resize-none"
                placeholder="List of symptoms observed or reported..."
                value={consultation.symptoms}
                onChange={(e) => setConsultation({...consultation, symptoms: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Prescriptions</label>
              <textarea 
                className="w-full h-24 bg-gray-100 border-2 border-gray-300 rounded p-3 resize-none"
                placeholder="Findings from physical examination..."
                value={consultation.examination}
                onChange={(e) => setConsultation({...consultation, examination: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">      
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pb-6">
        <div className="px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded">
           Generate Prescription
        </div>
        <div className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded">
          Save as Draft
        </div>
        <div 
          className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded cursor-pointer"
          onClick={onComplete}
        >
          Complete & Generate Invoice
        </div>
      </div>
    </div>
  );
}