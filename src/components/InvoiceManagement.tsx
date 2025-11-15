import React, { useState } from 'react';

// Mock invoice data
const invoices = [
  { id: 'INV-001', patientName: 'John Smith', date: '2025-06-17', amount: 150.00, status: 'paid' },
  { id: 'INV-002', patientName: 'Emily Davis', date: '2025-06-16', amount: 200.00, status: 'pending' },
  { id: 'INV-003', patientName: 'Michael Brown', date: '2025-06-15', amount: 300.00, status: 'overdue' },
  { id: 'INV-004', patientName: 'Sarah Wilson', date: '2025-06-17', amount: 125.00, status: 'draft' },
  { id: 'INV-005', patientName: 'David Johnson', date: '2025-06-14', amount: 180.00, status: 'paid' }
];

export function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedInvoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div 
            className="w-24 h-8 bg-gray-100 border-2 border-gray-300 rounded cursor-pointer"
            onClick={() => setSelectedInvoice(null)}
          ></div>
          <div className="flex space-x-2">
            <div className="w-24 h-8 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <div className="w-20 h-8 bg-blue-200 border-2 border-blue-400 rounded"></div>
          </div>
        </div>

        <div className="border-2 border-gray-300 p-8 bg-white">
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="h-8 bg-gray-400 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                  <div className="h-4 bg-green-200 rounded w-16"></div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="border-2 border-gray-300">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-100 border-b-2 border-gray-300">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-16 justify-self-end"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-4 p-3 border-b border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-12 justify-self-end"></div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 p-3 border-t-2 border-gray-400 bg-gray-50">
                <div className="h-4 bg-gray-400 rounded w-16"></div>
                <div className="h-5 bg-gray-500 rounded w-16 justify-self-end"></div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gray-100 p-4 border-2 border-gray-200 rounded">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Invoice Management</h1>
          <p className="text-gray-600">Track and manage patient billing</p>
        </div>
        <div className="px-4 py-2 bg-blue-200 border-2 border-blue-400 rounded">
          + Create Invoice
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
              <p className="text-2xl font-semibold">$330,000</p>
            </div>
            <div className="w-8 h-8 bg-green-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Pending</p>
              <p className="text-2xl font-semibold">$200</p>
            </div>
            <div className="w-8 h-8 bg-yellow-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Overdue</p>
              <p className="text-2xl font-semibold">$300</p>
            </div>
            <div className="w-8 h-8 bg-red-300 rounded"></div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Invoices</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
            <div className="w-8 h-8 bg-blue-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="border-2 border-gray-300 p-4 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              className="w-full h-10 bg-gray-100 border-2 border-gray-300 rounded px-3"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded">
            Filter Status ▼
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border-2 border-gray-300 bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-100 border-b-2 border-gray-300 font-medium">
          <div>Invoice ID</div>
          <div>Patient</div>
          <div>Date</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Due Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {/* Table Rows */}
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 items-center">
            <div className="font-medium">{invoice.id}</div>
            <div>{invoice.patientName}</div>
            <div className="text-sm text-gray-600">{invoice.date}</div>
            <div className="text-sm">{invoice.status === 'paid' ? 'Consultation' : 'Follow-up'}</div>
            <div className="font-medium">${invoice.amount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">{invoice.date}</div>
            <div className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs inline-block">
              {invoice.status}
            </div>
            <div className="flex space-x-2">
              <div 
                className="w-6 h-6 bg-gray-100 border border-gray-300 rounded cursor-pointer flex items-center justify-center text-xs"
                onClick={() => setSelectedInvoice(invoice)}
              >
                View
              </div>
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs">
                📥
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredInvoices.length === 0 && (
        <div className="border-2 border-gray-300 p-12 text-center bg-white">
          <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="w-20 h-8 bg-gray-100 border-2 border-gray-300 rounded mx-auto"></div>
        </div>
      )}
    </div>
  );
}