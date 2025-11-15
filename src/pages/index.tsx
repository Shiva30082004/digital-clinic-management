import { useState } from "react";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientList } from "@/components/PatientList";
import { PatientProfile } from "@/components/PatientProfile";
import { ConsultationScreen } from "@/components/ConsultationScreen";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import axios from "axios";
import { getBaseUrl } from "@/utils/server.utils";

export default function App({ patients = [] }) {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "patients", label: "Patients" },
    { id: "invoices", label: "Invoices" },
    { id: "analytics", label: "Analytics" }
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return (
          <DoctorDashboard
            onPatientSelect={(patient) => {
              setSelectedPatient(patient);
              setCurrentScreen("patient-profile");
            }}
            onStartConsultation={(appointment) => {
              setSelectedAppointment(appointment);
              setCurrentScreen("consultation");
            }}
          />
        );
      case "patients":
        return (
          <PatientList
            patients={patients}
            onPatientSelect={(patient) => {
              setSelectedPatient(patient);
              setCurrentScreen("patient-profile");
            }}
          />
        );
      case "patient-profile":
        return (
          <PatientProfile
            patient={selectedPatient}
            onBack={() => setCurrentScreen("patients")}
            onStartConsultation={(appointment) => {
              setSelectedAppointment(appointment);
              setCurrentScreen("consultation");
            }}
          />
        );
      case "consultation":
        return (
          <ConsultationScreen
            appointment={selectedAppointment}
            onComplete={() => setCurrentScreen("dashboard")}
            onCancel={() => setCurrentScreen("dashboard")}
          />
        );
      case "invoices":
        return <InvoiceManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar - Low Fidelity */}
      <div className="w-64 bg-white border-r-2 border-gray-300">
        <div className="p-4 border-b-2 border-gray-300">
          <h2 className="text-lg font-semibold mb-2">Digi Clinic</h2>
          <p className="text-sm text-gray-600">Dr. Doctor</p>
        </div>
        <div className="p-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 mb-2 border-2 cursor-pointer ${
                currentScreen === item.id
                  ? "bg-gray-300 border-gray-500"
                  : "bg-gray-100 border-gray-300"
              }`}
              onClick={() => setCurrentScreen(item.id)}>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderScreen()}</div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  console.log(getBaseUrl());
  const { data: patients = [] } = await axios.get(
    `${getBaseUrl()}/api/patient`
  );

  return {
    props: {
      patients
    }
  };
}
