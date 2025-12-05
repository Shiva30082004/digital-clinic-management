import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { checkAuthStatus, getFirebaseAuth } from "@/utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Lock, Mail, User, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import useApiCall from "@/hooks/useApiCall";

export default function SignupPage() {
  const router = useRouter();
  const [adminSignup, setAdminSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    consultationFees: 0,
    clinicName: "",
    zipcode: ""
  });
  const [consultantSignup, setConsultantSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    consultationFees: 0,
    clinicId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { invokeRequest } = useApiCall();

  useEffect(() => {
    checkAuthStatus("/signup", router);
  }, []);

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminSignup.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (adminSignup.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (adminSignup.password !== adminSignup.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await invokeRequest({
        endpoint: "/api/auth/signup",
        payload: {
          firstName: adminSignup.firstName,
          lastName: adminSignup.lastName,
          emailAddress: adminSignup.email,
          role: "admin",
          specialization: adminSignup.specialization,
          clinicName: adminSignup.clinicName,
          zipcode: adminSignup.zipcode,
          consultationFees: adminSignup.consultationFees
        },
        method: "POST"
      });

      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(
        auth,
        adminSignup.email,
        adminSignup.password
      );

      // Redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error("Admin signup error:", err);
      const errorMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultantSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(consultantSignup.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (consultantSignup.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (consultantSignup.password !== consultantSignup.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await invokeRequest({
        endpoint: "/api/auth/signup",
        payload: {
          firstName: consultantSignup.firstName,
          lastName: consultantSignup.lastName,
          emailAddress: consultantSignup.email,
          role: "consultant",
          specialization: consultantSignup.specialization,
          clinicID: consultantSignup.clinicId,
          consultationFees: consultantSignup.consultationFees
        },
        method: "POST"
      });

      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(
        auth,
        consultantSignup.email,
        consultantSignup.password
      );

      // Redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error("Consultant signup error:", err);
      const errorMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email address is already registered.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Signup failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Create Doctor Account
          </h1>
          <p className="text-slate-600 mt-2">
            Sign up to get started with Clinic Management
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Doctor Signup</CardTitle>
            <CardDescription>
              Choose your role and fill in your details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="consultant">Consultant</TabsTrigger>
              </TabsList>

              {/* Admin Signup */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-firstName">First Name</Label>
                      <Input
                        id="admin-firstName"
                        type="text"
                        placeholder="John"
                        value={adminSignup.firstName}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            firstName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-lastName">Last Name</Label>
                      <Input
                        id="admin-lastName"
                        type="text"
                        placeholder="Doe"
                        value={adminSignup.lastName}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            lastName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@clinic.com"
                        className="pl-10"
                        value={adminSignup.email}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            email: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={adminSignup.password}
                          onChange={(e) =>
                            setAdminSignup({
                              ...adminSignup,
                              password: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirmPassword">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="admin-confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={adminSignup.confirmPassword}
                          onChange={(e) =>
                            setAdminSignup({
                              ...adminSignup,
                              confirmPassword: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-specialization">Specialization</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="admin-specialization"
                        type="text"
                        placeholder="e.g., Cardiology, Pediatrics"
                        className="pl-10"
                        value={adminSignup.specialization}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            specialization: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-consultation-fees">
                      Consultation Fees
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-consultation-fees"
                        type="text"
                        placeholder="Consultation Fees"
                        value={adminSignup.consultationFees}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            consultationFees: Number.isNaN(e.target.value)
                              ? 0
                              : Number(e.target.value)
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-clinicName">Clinic Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="admin-clinicName"
                        type="text"
                        placeholder="Your Clinic Name"
                        className="pl-10"
                        value={adminSignup.clinicName}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            clinicName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-zipcode">Zipcode</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="admin-zipcode"
                        type="text"
                        placeholder="Your Clinic Zipcode"
                        className="pl-10"
                        value={adminSignup.zipcode}
                        onChange={(e) =>
                          setAdminSignup({
                            ...adminSignup,
                            zipcode: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign Up as Admin"}
                  </Button>
                </form>
              </TabsContent>

              {/* Consultant Signup */}
              <TabsContent value="consultant">
                <form onSubmit={handleConsultantSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultant-firstName">First Name</Label>
                      <Input
                        id="consultant-firstName"
                        type="text"
                        placeholder="John"
                        value={consultantSignup.firstName}
                        onChange={(e) =>
                          setConsultantSignup({
                            ...consultantSignup,
                            firstName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultant-lastName">Last Name</Label>
                      <Input
                        id="consultant-lastName"
                        type="text"
                        placeholder="Doe"
                        value={consultantSignup.lastName}
                        onChange={(e) =>
                          setConsultantSignup({
                            ...consultantSignup,
                            lastName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="consultant-email"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className="pl-10"
                        value={consultantSignup.email}
                        onChange={(e) =>
                          setConsultantSignup({
                            ...consultantSignup,
                            email: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultant-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="consultant-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={consultantSignup.password}
                          onChange={(e) =>
                            setConsultantSignup({
                              ...consultantSignup,
                              password: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultant-confirmPassword">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="consultant-confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={consultantSignup.confirmPassword}
                          onChange={(e) =>
                            setConsultantSignup({
                              ...consultantSignup,
                              confirmPassword: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant-specialization">
                      Specialization
                    </Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="consultant-specialization"
                        type="text"
                        placeholder="e.g., Cardiology, Pediatrics"
                        className="pl-10"
                        value={consultantSignup.specialization}
                        onChange={(e) =>
                          setConsultantSignup({
                            ...consultantSignup,
                            specialization: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant-consultation-fees">
                      Consultation Fees
                    </Label>
                    <Input
                      id="consultant-consultation-fees"
                      type="text"
                      placeholder="Consultation Fees"
                      value={consultantSignup.consultationFees}
                      onChange={(e) =>
                        setConsultantSignup({
                          ...consultantSignup,
                          consultationFees: Number.isNaN(e.target.value)
                            ? 0
                            : Number(e.target.value)
                        })
                      }
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Contact your clinic administrator for the clinic ID
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant-clinicId">Clinic ID</Label>
                    <Input
                      id="consultant-clinicId"
                      type="text"
                      placeholder="Enter clinic ID"
                      value={consultantSignup.clinicId}
                      onChange={(e) =>
                        setConsultantSignup({
                          ...consultantSignup,
                          clinicId: e.target.value
                        })
                      }
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Contact your clinic administrator for the clinic ID
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}>
                    {isLoading
                      ? "Creating Account..."
                      : "Sign Up as Consultant"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Login here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
