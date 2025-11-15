import Patient from "@/types/Patient";
import React, { useState } from "react";

// Mock patient data
// const patients = [
//   { id: 1, name: "Jahnavi J", age: "XX", status: "active" },
//   { id: 2, name: "Arjun S", age: "XX", status: "active" },
//   { id: 3, name: "Grace L", age: "XX", status: "active" },
//   { id: 4, name: "Shiv B", age: "XX", status: "inactive" },
//   { id: 5, name: "David D", age: "XX", status: "active" },
//   { id: 6, name: "Lisa A", age: "XX", status: "active" }
// ];
// ];

export function PatientList({
  patients = [],
  onPatientSelect
}: {
  patients: Patient[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Patients</h1>
          <p className="text-gray-600">Manage your patient records</p>
        </div>
        <div className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded">
          + Add New Patient
        </div>
      </div>

      {/* Search and Filter */}
      <div className="border-2 border-gray-300 p-4 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              className="w-full h-10 bg-gray-100 border-2 border-gray-300 rounded px-3"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-gray-200 border-2 border-gray-400 rounded text-sm">
              All (6)
            </div>
            <div className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded text-sm">
              Active (5)
            </div>
            <div className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded text-sm">
              Inactive (1)
            </div>
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="border-2 border-gray-300 p-6 cursor-pointer hover:bg-gray-50 bg-white">
            <div className="space-y-4">
              {/* Patient Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-gray-600">Age: {patient.age}</p>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Blood:</span>
                  <span>A+</span>
                </div>
                <p className="text-sm text-gray-600">📞 +1 (555) 123-4567</p>
                <p className="text-sm text-gray-600">
                  ✉️ {patient.name.toLowerCase().replace(" ", ".")}
                  @email.com
                </p>
              </div>

              {/* Visit Information */}
              {/* <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Visit:</span>
                  <span>Jun 15, 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Appointment:</span>
                  <span>Jun 20, 2025</span>
                </div>
              </div> */}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <div
                  className="flex-1 h-8 bg-blue-200 border-2 border-blue-400 rounded cursor-pointer flex items-center justify-center"
                  onClick={() => onPatientSelect(patient)}>
                  View Profile
                </div>
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                  📅
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPatients.length === 0 && (
        <div className="border-2 border-gray-300 p-12 text-center bg-white">
          <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-4 flex items-center justify-center">
            👤
          </div>
          <h3 className="font-semibold mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No patients match "${searchTerm}"`
              : "No patients in this category"}
          </p>
          <div className="w-24 h-8 bg-gray-100 border-2 border-gray-300 rounded mx-auto flex items-center justify-center">
            Clear Search
          </div>
        </div>
      )}
    </div>
  );
}
