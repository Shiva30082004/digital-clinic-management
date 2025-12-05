import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
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
import { Stethoscope, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [consultantCredentials, setConsultantCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthStatus("/login", router);
  }, []);

  const handleConsultantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(consultantCredentials.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(
        auth,
        consultantCredentials.email,
        consultantCredentials.password
      );

      // Redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error("Consultant login error:", err);
      const errorMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      default:
        return "Login failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Clinic Management
          </h1>
          <p className="text-slate-600 mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Doctor Login</CardTitle>
            <CardDescription>Enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="consultant" className="w-full">
              {/* Consultant Login */}
              <TabsContent value="consultant">
                <form onSubmit={handleConsultantLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultant-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="consultant-email"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className="pl-10"
                        value={consultantCredentials.email}
                        onChange={(e) =>
                          setConsultantCredentials({
                            ...consultantCredentials,
                            email: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultant-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="consultant-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={consultantCredentials.password}
                        onChange={(e) =>
                          setConsultantCredentials({
                            ...consultantCredentials,
                            password: e.target.value
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
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              <p>
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:underline">
                  Sign up here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
