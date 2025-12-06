import React, { useState } from "react";
import useApiCall from "@/hooks/useApiCall";
import type Invoice from "@/types/Invoice";

import {
  Search,
  Plus,
  Eye,
  Download,
  Printer,
  FileText,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <CheckCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "overdue":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "overdue":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "draft":
      return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  }
};

type UiInvoice = {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: string;
};

export function InvoiceManagement() {
  const {
    data: apiInvoices,
    isLoading,
    isError,
    error,
    refetch
  } = useApiCall<Invoice[]>({
    request: {
      endpoint: "/api/invoice",
      method: "GET"
    },
    fetchOnMount: true
  });

  const invoices: UiInvoice[] =
    (apiInvoices || []).map((inv) => ({
      id: String(inv.InvoiceID),
      patientName: `Appointment #${inv.AppointmentID}`,
      date: "", 
      amount: Number(inv.Amount ?? 0),
      status: "paid"
    }));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<UiInvoice | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [procedures, setProcedures] = useState([
    { id: 1, description: "General Consultation", amount: 150.0 }
  ]);
  const [newProcedure, setNewProcedure] = useState({
    description: "",
    amount: ""
  });

  const addProcedure = () => {
    if (newProcedure.description && newProcedure.amount) {
      setProcedures([
        ...procedures,
        {
          id: procedures.length + 1,
          description: newProcedure.description,
          amount: parseFloat(newProcedure.amount)
        }
      ]);
      setNewProcedure({ description: "", amount: "" });
    }
  };

  const removeProcedure = (id: number) => {
    setProcedures(procedures.filter((p) => p.id !== id));
  };

  const getTotalAmount = () => {
    return procedures.reduce((sum, proc) => sum + proc.amount, 0);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-4">Loading invoices...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 space-y-2">
        <p>Failed to load invoices.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={refetch} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Invoice
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Detail View */}
        <Card className="border-slate-200">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    DigiClinic
                  </h2>
                  <p className="text-slate-600">Healthcare Management</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mt-2">
                    Invoice: {selectedInvoice.id}
                  </p>
                  <p className="text-sm text-slate-600">
                    Date: {selectedInvoice.date || "-"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Bill To:</h3>
                  <p className="text-slate-700">
                    {selectedInvoice.patientName}
                  </p>
                  <p className="text-sm text-slate-600">Patient ID: P001</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Amount Due:
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ${getTotalAmount().toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">
                    Procedures & Services
                  </h3>
                  {isEditing && (
                    <Badge variant="outline" className="text-slate-600">
                      Edit Mode
                    </Badge>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      {isEditing && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure) => (
                      <TableRow key={procedure.id}>
                        <TableCell>{procedure.description}</TableCell>
                        <TableCell className="text-right">
                          ${procedure.amount.toFixed(2)}
                        </TableCell>
                        {isEditing && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProcedure(procedure.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* Add New Procedure Row */}
                    {isEditing && (
                      <TableRow className="bg-slate-50">
                        <TableCell>
                          <Input
                            placeholder="Procedure description..."
                            value={newProcedure.description}
                            onChange={(e) =>
                              setNewProcedure({
                                ...newProcedure,
                                description: e.target.value
                              })
                            }
                            className="border-slate-300"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={newProcedure.amount}
                            onChange={(e) =>
                              setNewProcedure({
                                ...newProcedure,
                                amount: e.target.value
                              })
                            }
                            className="border-slate-300 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={addProcedure}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow className="border-t-2">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold text-lg">
                        ${getTotalAmount().toFixed(2)}
                      </TableCell>
                      {isEditing && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Payment Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Payment Information
                </h3>
                <p className="text-sm text-slate-600">
                  Please make payment within 30 days. Thank you for choosing
                  DigiClinic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Invoices</h1>
          <p className="text-slate-600">{invoices.length} total invoices</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by invoice ID or patient name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage and track all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <TableCell className="font-medium">
                    {invoice.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                        {invoice.patientName.charAt(0)}
                      </div>
                      <span>{invoice.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {invoice.date || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* No Results */}
      {filteredInvoices.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900 mb-2">
              No invoices found
            </h3>
            <p className="text-slate-600">
              {searchTerm
                ? `No invoices match "${searchTerm}"`
                : "No invoices available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
