import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientList } from "@/components/PatientList";
import { PatientProfile } from "@/components/PatientProfile";
import { ConsultationScreen } from "@/components/ConsultationScreen";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Search,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { getFirebaseAuth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import useApiCall from "@/hooks/useApiCall";
import Appointment from "@/types/Appointment";
import useGeneratePrescription from "@/hooks/useGeneratePrescription";

export default function App() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    specialization: "",
    clinicName: "",
    zipcode: "",
    consultationFees: 0
  });

  const {
    isLoading = false,
    isSuccess = false,
    data: doctorProfileData = {},
    refetch
  } = useApiCall({
    request: {
      endpoint: "/api/doctor",
      method: "GET"
    },
    fetchOnMount: true
  });

  const { data: topProcedures = [] } = useApiCall({
    request: {
      endpoint: "/api/procedure/getTopProcedures",
      method: "GET"
    },
    fetchOnMount: !!doctorProfileData?.doctorId
  });

  const { invokeRequest: invokeSaveProfile } = useApiCall();

  useEffect(() => {
    if (isSuccess && doctorProfileData) {
      setDoctorProfile({
        firstName: doctorProfileData.firstName,
        lastName: doctorProfileData.lastName,
        emailAddress: doctorProfileData.emailAddress,
        specialization: doctorProfileData.specialization,
        clinicName: doctorProfileData.clinicName,
        zipcode: doctorProfileData.zipcode,
        consultationFees: doctorProfileData.consultationFees
      });
    }
  }, [isSuccess, doctorProfileData]);

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await invokeSaveProfile({
        endpoint: "/api/doctor",
        payload: doctorProfile,
        method: "PUT"
      });
      refetch();
      setIsEditProfileOpen(false);
    } catch (e) {
      console.log("Error updating profile:", e);
    }
  };

  const { invokeRequest: invokeChangeAppointmentStatus } = useApiCall();

  const { invokeGeneratePrescription } = useGeneratePrescription();

  // Show loading or nothing while checking auth
  if (isLoading) {
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
    { id: "patients", label: "Patients", icon: Users }
  ];

  const onStartConsultation = async (appointment: Appointment) => {
    switch (appointment?.appointmentStatus) {
      case "BKD":
        await invokeChangeAppointmentStatus({
          endpoint: "/api/appointments/status",
          params: { id: appointment?.appointmentID || "" },
          payload: { appointmentStatus: "ACT" },
          method: "PATCH"
        });
        setSelectedAppointment(appointment);
        setCurrentScreen("consultation");
        break;
      case "ACT":
        setSelectedAppointment(appointment);
        setCurrentScreen("consultation");
        break;
      case "COM":
        await invokeGeneratePrescription(appointment?.appointmentID || "");
        break;
      case "CAN":
      default:
    }
  };

  const onPatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentScreen("patient-profile");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return (
          <DoctorDashboard
            doctorInfo={doctorProfileData}
            onStartConsultation={onStartConsultation}
          />
        );
      case "patients":
        return <PatientList onPatientSelect={onPatientSelect} />;
      case "patient-profile":
        return (
          <PatientProfile
            doctorInfo={doctorProfileData}
            patientId={selectedPatientId}
            onBack={() => setCurrentScreen("patients")}
            onStartConsultation={onStartConsultation}
          />
        );
      case "consultation":
        return (
          <ConsultationScreen
            appointmentId={selectedAppointment?.appointmentID || ""}
            onComplete={() => setCurrentScreen("dashboard")}
            onCancel={() => setCurrentScreen("dashboard")}
            onPatientSelect={onPatientSelect}
          />
        );
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
              {(
                (doctorProfileData?.clinicName || "").split(" ")?.[0] || ""
              ).slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {doctorProfileData?.clinicName || ""}
              </h2>
              <p className="text-xs text-slate-500">Healthcare Management</p>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                DR
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                Dr. {doctorProfileData?.firstName || ""}{" "}
                {/* {doctorProfileData?.lastName || ""} */}
              </p>
              <p className="text-xs text-slate-500">
                {doctorProfileData?.specialization || ""}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {doctorProfileData?.role === "admin" ? "Admin" : "Consultant"}
            </Badge>
          </div>

          {(topProcedures || []).length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 mb-1 truncate">
                  Top Procedures
                </p>
                {(topProcedures || []).map((procedure, i) => {
                  return (
                    <p
                      key={procedure.procedureName}
                      className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">#{i + 1}</span>{" "}
                      {procedure.procedureName}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
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
                onClick={() => setCurrentScreen(item.id)}>
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
            className="w-full justify-start h-11 text-slate-600 hover:bg-slate-50"
            onClick={() => setIsEditProfileOpen(true)}>
            <UserCog className="mr-3 h-5 w-5" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}>
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
              {currentScreen === "patient-profile"
                ? "Patient Profile"
                : currentScreen}
            </h1>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-6">{renderScreen()}</div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={doctorProfile.firstName}
                  onChange={(e) =>
                    setDoctorProfile({
                      ...doctorProfile,
                      firstName: e.target.value
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={doctorProfile.lastName}
                  onChange={(e) =>
                    setDoctorProfile({
                      ...doctorProfile,
                      lastName: e.target.value
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                type="emailAddress"
                value={doctorProfile.emailAddress}
                disabled
                // onChange={(e) =>
                //   setDoctorProfile({ ...doctorProfile, emailAddress: e.target.value })
                // }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={doctorProfile.specialization}
                onChange={(e) =>
                  setDoctorProfile({
                    ...doctorProfile,
                    specialization: e.target.value
                  })
                }
              />
            </div>
            {doctorProfileData?.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input
                  id="clinicName"
                  value={doctorProfile.clinicName}
                  onChange={(e) =>
                    setDoctorProfile({
                      ...doctorProfile,
                      clinicName: e.target.value
                    })
                  }
                />
              </div>
            )}
            {doctorProfileData?.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input
                  id="zipcode"
                  value={doctorProfile.zipcode}
                  onChange={(e) =>
                    setDoctorProfile({
                      ...doctorProfile,
                      zipcode: e.target.value
                    })
                  }
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="consultationFees">Consultation Fees ($)</Label>
              <Input
                id="consultationFees"
                type="number"
                min="0"
                step="0.01"
                value={doctorProfile.consultationFees}
                onChange={(e) =>
                  setDoctorProfile({
                    ...doctorProfile,
                    consultationFees: Number.isNaN(e.target.value)
                      ? 0
                      : Number(e.target.value)
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
