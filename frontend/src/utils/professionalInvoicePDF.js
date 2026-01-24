import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate Professional Gold ERP Invoice PDF
 * Focus: Calculation correctness, money flow, and professional financial breakdown
 */
export const generateProfessionalInvoicePDF = (invoiceData, shopSettings, payments = []) => {
  try {
    const { invoice } = invoiceData;
    const doc = new jsPDF();
    
    // ============================================================================
    // HEADER SECTION - Company Information (Placeholder)
    // ============================================================================
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(shopSettings.shop_name || 'Gold Jewellery ERP', 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(shopSettings.address || '123 Main Street, City, Country', 105, 22, { align: 'center' });
    doc.text(`Phone: ${shopSettings.phone || '+968 1234 5678'} | Email: ${shopSettings.email || 'contact@shop.com'}`, 105, 27, { align: 'center' });
    doc.text(`GSTIN: ${shopSettings.gstin || 'GST1234567890'}`, 105, 32, { align: 'center' });
    
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(15, 36, 195, 36);
    
    // ============================================================================
    // INVOICE TITLE
    // ============================================================================
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TAX INVOICE', 105, 45, { align: 'center' });
    
    // ============================================================================
    // INVOICE METADATA
    // ============================================================================
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Left side - Invoice details
    doc.setFont(undefined, 'bold');
    doc.text('Invoice No:', 15, 55);
    doc.text('Invoice Date:', 15, 61);
    doc.text('Status:', 15, 67);
    
    doc.setFont(undefined, 'normal');
    doc.text(invoice.invoice_number || 'N/A', 45, 55);
    doc.text(invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A', 45, 61);
    doc.text((invoice.status || 'draft').toUpperCase(), 45, 67);
    
    // Right side - Customer details
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 120, 55);
    doc.setFont(undefined, 'normal');
    
    let customerName = 'Walk-in Customer';
    let customerPhone = '';
    let customerAddress = '';
    let customerGSTIN = '';
    
    if (invoice.customer_type === 'saved') {
      customerName = invoice.customer_name || 'N/A';
      if (invoiceData.customer_details) {
        customerPhone = invoiceData.customer_details.phone || invoice.customer_phone || '';
        customerAddress = invoiceData.customer_details.address || invoice.customer_address || '';
        customerGSTIN = invoiceData.customer_details.gstin || invoice.customer_gstin || '';
      }
    } else {
      customerName = invoice.walk_in_name || 'Walk-in Customer';
      customerPhone = invoice.walk_in_phone || '';
    }
    
    doc.text(customerName, 120, 61);
    if (customerPhone) doc.text(`Phone: ${customerPhone}`, 120, 67);
    if (customerAddress) {
      const addressLines = doc.splitTextToSize(customerAddress, 75);
      doc.text(addressLines, 120, 73);
    }
    if (customerGSTIN) doc.text(`GSTIN: ${customerGSTIN}`, 120, 85);
    
    // ============================================================================
    // ITEMS TABLE - Gold Jewellery Breakdown
    // ============================================================================
    const startY = customerGSTIN || customerAddress ? 95 : 80;
    
    const tableHeaders = [
      'Item',
      'Qty',
      'Gross Wt(g)',
      'Stone Wt(g)',
      'Net Gold(g)',
      'Purity',
      'Rate/g',
      'Gold Val',
      'Making',
      'Stone',
      'Wastage',
      'Disc',
      'Tax',
      'Total'
    ];
    
    const tableData = (invoice.items || []).map(item => {
      const grossWeight = item.gross_weight || item.weight || 0;
      const stoneWeight = item.stone_weight || 0;
      const netGoldWeight = item.net_gold_weight || (grossWeight - stoneWeight);
      
      return [
        item.description || '',
        item.qty || 0,
        grossWeight.toFixed(3),
        stoneWeight.toFixed(3),
        netGoldWeight.toFixed(3),
        item.purity || 916,
        (item.metal_rate || 0).toFixed(2),
        (item.gold_value || 0).toFixed(2),
        (item.making_value || 0).toFixed(2),
        (item.stone_charges || 0).toFixed(2),
        (item.wastage_charges || 0).toFixed(2),
        (item.item_discount || 0).toFixed(2),
        (item.vat_amount || 0).toFixed(2),
        (item.line_total || 0).toFixed(2)
      ];
    });
    
    doc.autoTable({
      startY: startY,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2
      },
      bodyStyles: { 
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'left' },    // Item
        1: { cellWidth: 10, halign: 'center' },  // Qty
        2: { cellWidth: 13, halign: 'right' },   // Gross Wt
        3: { cellWidth: 13, halign: 'right' },   // Stone Wt
        4: { cellWidth: 13, halign: 'right' },   // Net Gold
        5: { cellWidth: 12, halign: 'center' },  // Purity
        6: { cellWidth: 12, halign: 'right' },   // Rate/g
        7: { cellWidth: 13, halign: 'right' },   // Gold Val
        8: { cellWidth: 12, halign: 'right' },   // Making
        9: { cellWidth: 12, halign: 'right' },   // Stone
        10: { cellWidth: 13, halign: 'right' },  // Wastage
        11: { cellWidth: 12, halign: 'right' },  // Disc
        12: { cellWidth: 12, halign: 'right' },  // Tax
        13: { cellWidth: 15, halign: 'right' }   // Total
      },
      margin: { left: 10, right: 10 }
    });
    
    // ============================================================================
    // CALCULATION BREAKDOWN
    // ============================================================================
    let currentY = doc.lastAutoTable.finalY + 10;
    const leftCol = 15;
    const rightCol = 195;
    
    doc.setFontSize(10);
    
    // Subtotal
    doc.setFont(undefined, 'normal');
    doc.text('Subtotal (Before Tax & Discount):', leftCol, currentY);
    doc.text(`${(invoice.subtotal || 0).toFixed(3)}`, rightCol, currentY, { align: 'right' });
    
    // Invoice-level discount (if any)
    const invoiceDiscount = invoice.discount_amount || 0;
    if (invoiceDiscount > 0) {
      currentY += 6;
      doc.text('Invoice Discount:', leftCol, currentY);
      doc.text(`-${invoiceDiscount.toFixed(3)}`, rightCol, currentY, { align: 'right' });
    }
    
    // Taxable amount
    currentY += 6;
    const taxableAmount = (invoice.subtotal || 0) - invoiceDiscount;
    doc.text('Taxable Amount:', leftCol, currentY);
    doc.text(`${taxableAmount.toFixed(3)}`, rightCol, currentY, { align: 'right' });
    
    // ============================================================================
    // TAX BREAKDOWN (CGST/SGST or IGST)
    // ============================================================================
    currentY += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Tax Breakdown:', leftCol, currentY);
    doc.setFont(undefined, 'normal');
    
    const taxType = invoice.tax_type || 'cgst_sgst';
    const gstPercent = invoice.gst_percent || 5.0;
    
    if (taxType === 'cgst_sgst') {
      // Intra-state: CGST + SGST
      const cgst = invoice.cgst_total || ((invoice.vat_total || 0) / 2);
      const sgst = invoice.sgst_total || ((invoice.vat_total || 0) / 2);
      const halfPercent = gstPercent / 2;
      
      currentY += 6;
      doc.text(`CGST (${halfPercent.toFixed(2)}%):`, leftCol + 10, currentY);
      doc.text(`${cgst.toFixed(3)}`, rightCol, currentY, { align: 'right' });
      
      currentY += 6;
      doc.text(`SGST (${halfPercent.toFixed(2)}%):`, leftCol + 10, currentY);
      doc.text(`${sgst.toFixed(3)}`, rightCol, currentY, { align: 'right' });
    } else {
      // Inter-state: IGST
      const igst = invoice.igst_total || (invoice.vat_total || 0);
      
      currentY += 6;
      doc.text(`IGST (${gstPercent.toFixed(2)}%):`, leftCol + 10, currentY);
      doc.text(`${igst.toFixed(3)}`, rightCol, currentY, { align: 'right' });
    }
    
    currentY += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Total Tax:', leftCol, currentY);
    doc.text(`${(invoice.vat_total || 0).toFixed(3)}`, rightCol, currentY, { align: 'right' });
    
    // ============================================================================
    // GRAND TOTAL
    // ============================================================================
    currentY += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Grand Total:', leftCol, currentY);
    doc.text(`${(invoice.grand_total || 0).toFixed(3)} OMR`, rightCol, currentY, { align: 'right' });
    
    // ============================================================================
    // PAYMENT SECTION
    // ============================================================================
    currentY += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', leftCol, currentY);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    if (payments && payments.length > 0) {
      currentY += 6;
      doc.setFontSize(9);
      
      // Payment breakdown
      const paymentHeaders = [['Payment Mode', 'Amount', 'Date', 'Notes']];
      const paymentData = payments.map(payment => [
        payment.mode || payment.payment_mode || 'N/A',
        `${(payment.amount || 0).toFixed(3)} OMR`,
        payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A',
        payment.notes || '-'
      ]);
      
      doc.autoTable({
        startY: currentY,
        head: paymentHeaders,
        body: paymentData,
        theme: 'striped',
        headStyles: { 
          fillColor: [52, 152, 219],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35 },
          3: { cellWidth: 75 }
        },
        margin: { left: 15, right: 15 }
      });
      
      currentY = doc.lastAutoTable.finalY + 6;
    } else {
      currentY += 6;
      doc.text('No payments recorded yet', leftCol, currentY);
      currentY += 6;
    }
    
    // Total paid
    currentY += 2;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total Paid:', leftCol, currentY);
    doc.text(`${(invoice.paid_amount || 0).toFixed(3)} OMR`, rightCol, currentY, { align: 'right' });
    
    // Balance due or change returned
    currentY += 6;
    const balanceDue = invoice.balance_due || 0;
    
    if (balanceDue > 0) {
      doc.setTextColor(200, 0, 0);  // Red for balance due
      doc.text('Balance Due:', leftCol, currentY);
      doc.text(`${balanceDue.toFixed(3)} OMR`, rightCol, currentY, { align: 'right' });
    } else if (balanceDue < 0) {
      doc.setTextColor(0, 150, 0);  // Green for change returned
      doc.text('Change Returned:', leftCol, currentY);
      doc.text(`${Math.abs(balanceDue).toFixed(3)} OMR`, rightCol, currentY, { align: 'right' });
    } else {
      doc.setTextColor(0, 150, 0);  // Green for fully paid
      doc.text('Payment Status:', leftCol, currentY);
      doc.text('PAID IN FULL', rightCol, currentY, { align: 'right' });
    }
    
    doc.setTextColor(0, 0, 0);  // Reset to black
    
    // ============================================================================
    // FOOTER - Terms & Conditions
    // ============================================================================
    currentY += 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Terms & Conditions:', leftCol, currentY);
    
    currentY += 5;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const terms = shopSettings.terms_and_conditions || 
      "1. Goods once sold cannot be returned.\n2. Gold purity as per invoice.\n3. Making charges are non-refundable.";
    const termsLines = terms.split('\n');
    termsLines.forEach(line => {
      doc.text(line, leftCol, currentY);
      currentY += 5;
    });
    
    // Authorized signature
    currentY += 10;
    doc.setFontSize(9);
    doc.text('_____________________', rightCol - 40, currentY);
    currentY += 5;
    doc.text(shopSettings.authorized_signatory || 'Authorized Signatory', rightCol - 40, currentY);
    
    // Computer generated note
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('This is a computer-generated invoice and does not require a signature', 105, 285, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error('Error generating professional invoice PDF:', error);
    throw error;
  }
};

/**
 * Download professional invoice PDF
 */
export const downloadProfessionalInvoicePDF = async (invoiceId, apiUrl, axiosInstance) => {
  try {
    // Fetch full invoice details
    const [invoiceResponse, settingsResponse] = await Promise.all([
      axiosInstance.get(`${apiUrl}/invoices/${invoiceId}/full-details`),
      axiosInstance.get(`${apiUrl}/settings/shop`)
    ]);
    
    const invoiceData = invoiceResponse.data;
    const shopSettings = settingsResponse.data;
    
    // Generate PDF
    const doc = generateProfessionalInvoicePDF(invoiceData, shopSettings, invoiceData.payments);
    
    // Download
    doc.save(`Invoice_${invoiceData.invoice.invoice_number || 'unknown'}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading professional invoice PDF:', error);
    return { success: false, error: error.message };
  }
};
