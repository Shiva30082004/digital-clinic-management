import Patient from "@/types/Patient";
import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  User,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Patients</h1>
          <p className="text-slate-600">{patients.length} total patients</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => onPatientSelect(patient)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Patient Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                      <p className="text-sm text-slate-500">Age: {patient.age}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* Patient Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Blood Group:</span>
                    <Badge variant="outline" className="font-mono">A+</Badge>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="h-3.5 w-3.5 mr-2" />
                    <span className="text-xs">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    <span className="text-xs truncate">
                      {patient.name.toLowerCase().replace(" ", ".")}@email.com
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPatientSelect(patient);
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle appointment booking
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPatients.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No patients found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm
                ? `No patients match "${searchTerm}"`
                : "No patients in this category"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
