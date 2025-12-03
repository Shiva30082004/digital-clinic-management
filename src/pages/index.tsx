import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientList } from "@/components/PatientList";
import { PatientProfile } from "@/components/PatientProfile";
import { ConsultationScreen } from "@/components/ConsultationScreen";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import axios from "axios";
import { getBaseUrl } from "@/utils/server.utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function App({ patients = [] }) {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // Not authenticated, redirect to login
      router.push('/login');
    } else {
      // Authenticated, allow access
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    router.push('/login');
  };

  // Show loading or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Users },
    { id: "invoices", label: "Invoices", icon: FileText }
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
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Clinic Logo & Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              DC
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">DigiClinic</h2>
              <p className="text-xs text-slate-500">Healthcare Management</p>
            </div>
          </div>
          
          {/* Doctor Info */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" />
              <AvatarFallback className="bg-blue-100 text-blue-600">DR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Dr. Doctor</p>
              <p className="text-xs text-slate-500">General Physician</p>
            </div>
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-11 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setCurrentScreen(item.id)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 capitalize">
              {currentScreen === "patient-profile" ? selectedPatient?.name || "Patient Profile" : currentScreen}
            </h1>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-6">{renderScreen()}</div>
        </div>
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
