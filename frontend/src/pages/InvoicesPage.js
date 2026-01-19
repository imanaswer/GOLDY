import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    }
  };

  const handlePrintInvoice = (invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Gold Shop ERP', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('TAX INVOICE', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 45);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 52);
    doc.text(`Customer: ${invoice.customer_name || 'N/A'}`, 20, 59);
    
    const tableData = invoice.items.map(item => [
      item.description,
      item.qty.toString(),
      item.purity.toString(),
      item.weight.toFixed(3),
      item.metal_rate.toFixed(3),
      item.gold_value.toFixed(3),
      item.making_value.toFixed(3),
      item.vat_amount.toFixed(3),
      item.line_total.toFixed(3)
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['Description', 'Qty', 'Purity', 'Weight(g)', 'Rate', 'Gold Val', 'Making', 'VAT', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [6, 95, 70], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 15, halign: 'right' },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 18, halign: 'right' },
        7: { cellWidth: 15, halign: 'right' },
        8: { cellWidth: 20, halign: 'right' }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${invoice.subtotal.toFixed(3)} OMR`, 150, finalY, { align: 'right' });
    doc.text(`VAT Total: ${invoice.vat_total.toFixed(3)} OMR`, 150, finalY + 7, { align: 'right' });
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ${invoice.grand_total.toFixed(3)} OMR`, 150, finalY + 14, { align: 'right' });
    doc.text(`Balance Due: ${invoice.balance_due.toFixed(3)} OMR`, 150, finalY + 21, { align: 'right' });
    
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
    toast.success('Invoice downloaded');
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    };
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div data-testid="invoices-page">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Invoices</h1>
          <p className="text-muted-foreground">Manage sales and service invoices</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Grand Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Balance Due</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{inv.customer_name || '-'}</td>
                    <td className="px-4 py-3 capitalize text-sm">{inv.invoice_type}</td>
                    <td className="px-4 py-3 text-right font-mono">{inv.grand_total.toFixed(3)}</td>
                    <td className="px-4 py-3 text-right font-mono">{inv.balance_due.toFixed(3)}</td>
                    <td className="px-4 py-3">{getPaymentStatusBadge(inv.payment_status)}</td>
                    <td className="px-4 py-3">
                      <Button
                        data-testid={`print-${inv.invoice_number}`}
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintInvoice(inv)}
                      >
                        <Printer className="w-4 h-4 mr-1" /> Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
